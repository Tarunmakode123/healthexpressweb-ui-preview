-- ============================================================
-- HEALTH EXPRESS — SUPABASE PRODUCTION SQL MIGRATION
-- HARDENED GUEST PRESCRIPTION CREATION & AUTHENTICATED LINKING RPCs
-- ============================================================

-- 0. Admin Helper Function (Safe fallback & strict search path)
create or replace function public.check_is_admin()
returns boolean language plpgsql security definer stable set search_path = public as $$
begin
  return coalesce(
    (select (raw_user_meta_data->>'is_admin')::boolean from auth.users where id = auth.uid()),
    false
  );
end;
$$;

-- 1. Helper function: Extract 10-digit canonical Indian mobile number
create or replace function public.clean_phone_10(p_input text)
returns text language plpgsql immutable as $$
declare
  v_digits text;
begin
  if p_input is null or p_input = '' then
    return '';
  end if;
  v_digits := regexp_replace(p_input, '\D', '', 'g');
  if length(v_digits) < 10 then
    return v_digits;
  end if;
  return right(v_digits, 10);
end;
$$;

revoke execute on function public.clean_phone_10(text) from public;
grant execute on function public.clean_phone_10(text) to anon, authenticated, service_role;

-- 2. HARDENED ATOMIC SECURITY DEFINER RPC: GUEST PRESCRIPTION SUBMISSION
drop function if exists public.submit_guest_prescription_secure(text, text, text, text, text, text, text, text, bigint, text);

create or replace function public.submit_guest_prescription_secure(
  p_full_name text,
  p_phone_e164 text,
  p_city text default 'Bengaluru',
  p_email text default null,
  p_enquiry_code text default null,
  p_file_path text default null,
  p_file_name text default null,
  p_file_type text default null,
  p_file_size bigint default 0,
  p_notes text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_patient_id uuid;
  v_enquiry_id uuid := gen_random_uuid();
  v_prescription_id uuid := gen_random_uuid();
  v_clean_phone_10 text;
  v_current_user_id uuid := auth.uid();
  v_auth_user_phone text;
  v_auth_phone_10 text := '';
  v_guest_match_count int := 0;
  v_single_guest_id uuid;
  v_code text;
  v_mime_lower text;
  v_max_size bigint := 10485760; -- 10MB
begin
  -- Input Validation 1: Phone number required (min 10 digits)
  v_clean_phone_10 := public.clean_phone_10(p_phone_e164);
  if length(v_clean_phone_10) < 10 then
    raise exception 'Invalid phone number. Minimum 10 digits required.';
  end if;

  -- Input Validation 2: File Path required
  if p_file_path is null or trim(p_file_path) = '' then
    raise exception 'Prescription file path is required.';
  end if;

  -- Input Validation 3: Namespace Security
  if v_current_user_id is null then
    -- Unauthenticated callers MUST target the guest/ namespace ONLY
    if p_file_path not like 'guest/%' then
      raise exception 'Unauthenticated uploads must target the guest/ namespace.';
    end if;
  else
    -- Authenticated callers allow guest/, prescriptions/, or uploads/
    if p_file_path not like 'guest/%' and p_file_path not like 'prescriptions/%' and p_file_path not like 'uploads/%' and p_file_path not like 'temp/%' then
      raise exception 'Invalid file path prefix. Path must start with guest/, prescriptions/, or uploads/.';
    end if;
  end if;

  -- Input Validation 4: File Type / MIME validation (Strict 7 explicit types, octet-stream removed)
  v_mime_lower := lower(trim(coalesce(p_file_type, '')));
  if v_mime_lower not in (
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) then
    raise exception 'Invalid file format (%). Supported: PDF, JPG, PNG, WEBP, DOC, DOCX.', p_file_type;
  end if;

  -- Input Validation 5: File Size limit (<= 10MB)
  if p_file_size <= 0 or p_file_size > v_max_size then
    raise exception 'Invalid file size. Maximum allowed limit is 10MB.';
  end if;

  -- Generate Server-Side Enquiry Code (with client suggestion fallback & conflict retry)
  if p_enquiry_code is not null and trim(p_enquiry_code) <> '' then
    v_code := trim(p_enquiry_code);
  else
    v_code := 'HE-2026-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
  end if;

  -- A. Patient Creation / Lookup with STRICT Guest vs. Authenticated Ownership Isolation & Ambiguity Guard
  if v_current_user_id is not null then
    -- AUTHENTICATED CALLER:
    -- Fail-closed: Read caller's verified phone directly from auth.users
    select coalesce(
      phone,
      raw_user_meta_data->>'phone',
      raw_user_meta_data->>'phone_e164',
      raw_user_meta_data->>'phone_number',
      ''
    )
    into v_auth_user_phone
    from auth.users
    where id = v_current_user_id;

    v_auth_phone_10 := public.clean_phone_10(v_auth_user_phone);

    -- FAIL-CLOSED SECURITY RULE 1: Authenticated user MUST have a valid phone in auth.users
    if length(v_auth_phone_10) < 10 then
      raise exception 'Access denied. Authenticated user profile does not have a verified 10-digit phone number.';
    end if;

    -- FAIL-CLOSED SECURITY RULE 2: Submitted phone MUST match authenticated user's phone
    if v_clean_phone_10 <> v_auth_phone_10 then
      raise exception 'Access denied. Authenticated user phone (%) does not match submitted phone (%).', v_auth_user_phone, p_phone_e164;
    end if;

    -- 1. Look up existing patient row already owned by this authenticated user with matching phone
    select id into v_patient_id
    from public.patients
    where user_id = v_current_user_id
      and public.clean_phone_10(phone_e164) = v_auth_phone_10
    order by created_at desc
    limit 1;

    -- 2. If not found by user_id & phone, check if unlinked guest patient profile(s) exist for this phone
    if v_patient_id is null then
      select count(*)
      into v_guest_match_count
      from public.patients
      where user_id is null
        and public.clean_phone_10(phone_e164) = v_auth_phone_10;

      if v_guest_match_count = 1 then
        select id into v_single_guest_id
        from public.patients
        where user_id is null
          and public.clean_phone_10(phone_e164) = v_auth_phone_10
        limit 1;

        -- Safely claim the single unlinked guest patient profile
        update public.patients
        set user_id = v_current_user_id,
            full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
            city = coalesce(nullif(trim(p_city), ''), city),
            email = coalesce(nullif(trim(p_email), ''), email),
            is_verified = true,
            updated_at = now()
        where id = v_single_guest_id;

        v_patient_id := v_single_guest_id;
      elsif v_guest_match_count > 1 then
        raise exception 'Ambiguous guest patient profiles found for phone %. Multiple unlinked records exist requiring manual review.', p_phone_e164;
      end if;
    else
      -- Update existing authenticated patient profile details
      update public.patients
      set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
          city = coalesce(nullif(trim(p_city), ''), city),
          email = coalesce(nullif(trim(p_email), ''), email),
          updated_at = now()
      where id = v_patient_id;
    end if;

    -- 3. If no matching record exists at all, create a new authenticated patient profile
    if v_patient_id is null then
      insert into public.patients (
        id, user_id, full_name, phone_e164, city, email, is_verified
      ) values (
        gen_random_uuid(),
        v_current_user_id,
        coalesce(nullif(trim(p_full_name), ''), 'Patient'),
        v_auth_user_phone,
        coalesce(nullif(trim(p_city), ''), 'Bengaluru'),
        nullif(trim(p_email), ''),
        true
      )
      returning id into v_patient_id;
    end if;

  else
    -- UNAUTHENTICATED GUEST CALLER (v_current_user_id IS NULL):
    -- STRICT SECURITY REQUIREMENT: Search ONLY for guest patient records where user_id IS NULL.
    -- NEVER attach to or overwrite an existing authenticated patient (user_id IS NOT NULL).
    select count(*)
    into v_guest_match_count
    from public.patients
    where user_id is null
      and public.clean_phone_10(phone_e164) = v_clean_phone_10;

    if v_guest_match_count = 1 then
      select id into v_patient_id
      from public.patients
      where user_id is null
        and public.clean_phone_10(phone_e164) = v_clean_phone_10
      limit 1;

      update public.patients
      set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
          city = coalesce(nullif(trim(p_city), ''), city),
          email = coalesce(nullif(trim(p_email), ''), email),
          updated_at = now()
      where id = v_patient_id;
    elsif v_guest_match_count > 1 then
      raise exception 'Ambiguous guest patient profiles found for phone %. Multiple unlinked records exist requiring manual review.', p_phone_e164;
    else
      insert into public.patients (
        id, user_id, full_name, phone_e164, city, email, is_verified
      ) values (
        gen_random_uuid(),
        null,
        coalesce(nullif(trim(p_full_name), ''), 'Guest Patient'),
        p_phone_e164,
        coalesce(nullif(trim(p_city), ''), 'Bengaluru'),
        nullif(trim(p_email), ''),
        false
      )
      returning id into v_patient_id;
    end if;
  end if;

  -- B. Atomic Enquiry Insertion (Strict uniqueness, no cross-patient overwrite)
  begin
    insert into public.enquiries (
      id,
      enquiry_code,
      patient_id,
      source,
      status,
      notes
    ) values (
      v_enquiry_id,
      v_code,
      v_patient_id,
      'website',
      'pending_review',
      nullif(trim(p_notes), '')
    );
  exception when unique_violation then
    -- Generate fresh guaranteed unique code on conflict (NEVER overwrite an existing enquiry)
    v_code := 'HE-2026-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    insert into public.enquiries (
      id,
      enquiry_code,
      patient_id,
      source,
      status,
      notes
    ) values (
      v_enquiry_id,
      v_code,
      v_patient_id,
      'website',
      'pending_review',
      nullif(trim(p_notes), '')
    );
  end;

  -- C. Atomic Prescription Metadata Insertion
  insert into public.prescriptions (
    id,
    enquiry_id,
    patient_id,
    file_path,
    file_name,
    file_type,
    file_size,
    user_id
  ) values (
    v_prescription_id,
    v_enquiry_id,
    v_patient_id,
    p_file_path,
    coalesce(p_file_name, 'prescription_document'),
    v_mime_lower,
    p_file_size,
    v_current_user_id
  );

  return jsonb_build_object(
    'success', true,
    'patient_id', v_patient_id,
    'enquiry_id', v_enquiry_id,
    'enquiry_code', v_code,
    'prescription_id', v_prescription_id
  );
end;
$$;

revoke execute on function public.submit_guest_prescription_secure(text, text, text, text, text, text, text, text, bigint, text) from public;
grant execute on function public.submit_guest_prescription_secure(text, text, text, text, text, text, text, text, bigint, text) to anon, authenticated, service_role;

-- 3. HARDENED SECURITY DEFINER LINKING RPC (FAIL-CLOSED & AMBIGUITY GUARD)
drop function if exists public.link_guest_records_on_otp_login();

create or replace function public.link_guest_records_on_otp_login()
returns jsonb as $$
declare
  current_user_id uuid := auth.uid();
  user_phone text;
  user_phone_10 text := '';
  primary_patient_id uuid;
  guest_match_count int := 0;
  single_guest_id uuid;
  linked_prescription_count int := 0;
  linked_enquiry_count int := 0;
begin
  if current_user_id is null then
    return jsonb_build_object(
      'success', false,
      'reason', 'unauthenticated',
      'normalized_phone', '',
      'primary_patient_id', null,
      'linked_prescription_count', 0,
      'linked_enquiry_count', 0
    );
  end if;

  -- Extract authenticated user's phone number
  select coalesce(
    phone,
    raw_user_meta_data->>'phone',
    raw_user_meta_data->>'phone_e164',
    raw_user_meta_data->>'phone_number',
    ''
  )
  into user_phone
  from auth.users
  where id = current_user_id;

  user_phone_10 := public.clean_phone_10(user_phone);

  -- FAIL-CLOSED SECURITY REQUIREMENT: Authenticated user MUST have a valid verified 10-digit phone
  if length(user_phone_10) < 10 then
    raise exception 'Access denied. Authenticated user profile does not have a verified 10-digit phone number.';
  end if;

  -- A. Determine Primary Patient Account for current_user_id (VERIFY PHONE CONSISTENCY)
  select id into primary_patient_id
  from public.patients
  where user_id = current_user_id
    and public.clean_phone_10(phone_e164) = user_phone_10
  order by created_at asc
  limit 1;

  if primary_patient_id is null then
    select count(*)
    into guest_match_count
    from public.patients
    where user_id is null
      and public.clean_phone_10(phone_e164) = user_phone_10;

    if guest_match_count = 1 then
      select id into single_guest_id
      from public.patients
      where user_id is null
        and public.clean_phone_10(phone_e164) = user_phone_10
      limit 1;

      update public.patients
      set user_id = current_user_id,
          is_verified = true,
          updated_at = now()
      where id = single_guest_id;

      primary_patient_id := single_guest_id;
    elsif guest_match_count > 1 then
      raise exception 'Ambiguous guest patient profiles found for phone %. Multiple unlinked records exist requiring manual review.', user_phone_10;
    else
      insert into public.patients (id, user_id, full_name, phone_e164, is_verified)
      values (
        gen_random_uuid(),
        current_user_id,
        coalesce((select raw_user_meta_data->>'full_name' from auth.users where id = current_user_id), 'Patient'),
        user_phone,
        true
      )
      returning id into primary_patient_id;
    end if;
  end if;

  -- B. Re-link ALL prescriptions matching this normalized phone or patient profile to primary_patient_id & current_user_id
  update public.prescriptions
  set user_id = current_user_id,
      patient_id = primary_patient_id
  where (user_id is null or user_id = current_user_id)
    and patient_id in (
      select id from public.patients
      where (user_id is null and public.clean_phone_10(phone_e164) = user_phone_10)
         or (user_id = current_user_id and public.clean_phone_10(phone_e164) = user_phone_10)
    );

  get diagnostics linked_prescription_count = row_count;

  -- C. Re-link ALL enquiries matching this normalized phone or patient profile to primary_patient_id
  update public.enquiries
  set patient_id = primary_patient_id
  where patient_id in (
    select id from public.patients
    where (user_id is null and public.clean_phone_10(phone_e164) = user_phone_10)
       or (user_id = current_user_id and public.clean_phone_10(phone_e164) = user_phone_10)
  );

  get diagnostics linked_enquiry_count = row_count;

  -- NOTE: NO DELETE FROM public.patients IS PERFORMED.
  -- All existing patient rows remain 100% intact.

  return jsonb_build_object(
    'success', true,
    'normalized_phone', user_phone_10,
    'primary_patient_id', primary_patient_id,
    'linked_prescription_count', linked_prescription_count,
    'linked_enquiry_count', linked_enquiry_count
  );
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.link_guest_records_on_otp_login() from public, anon;
grant execute on function public.link_guest_records_on_otp_login() to authenticated, service_role;

-- 4. STRICT OWNERSHIP ROW LEVEL SECURITY (RLS) POLICIES ON PUBLIC TABLES
alter table public.patients enable row level security;
alter table public.enquiries enable row level security;
alter table public.prescriptions enable row level security;

drop policy if exists "Users can view own patient profile" on public.patients;
create policy "Users can view own patient profile" on public.patients
  for select using (
    public.check_is_admin() = true or
    (auth.uid() is not null and auth.uid() = user_id)
  );

drop policy if exists "Users can update own patient profile" on public.patients;
create policy "Users can update own patient profile" on public.patients
  for update using (
    public.check_is_admin() = true or
    (auth.uid() is not null and auth.uid() = user_id)
  );

drop policy if exists "Users can view own prescriptions" on public.prescriptions;
create policy "Users can view own prescriptions" on public.prescriptions
  for select using (
    public.check_is_admin() = true or
    auth.uid() = user_id or
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

drop policy if exists "Users can view own enquiries" on public.enquiries;
create policy "Users can view own enquiries" on public.enquiries
  for select using (
    public.check_is_admin() = true or
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

-- 5. NAMESPACED STORAGE BUCKET & ROW LEVEL SECURITY (RLS) POLICIES FOR PRESCRIPTIONS
insert into storage.buckets (id, name, public)
values ('prescriptions', 'prescriptions', false)
on conflict (id) do update set public = false;

drop policy if exists "Allow guest and authenticated upload to prescriptions bucket" on storage.objects;
drop policy if exists "Allow guest upload to prescriptions bucket" on storage.objects;
drop policy if exists "Allow authenticated upload to prescriptions bucket" on storage.objects;

-- Strict Guest Upload Policy: Unauthenticated uploads MUST target the guest/ namespace
create policy "Allow guest upload to prescriptions bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'prescriptions' and
    name like 'guest/%'
  );

-- Authenticated Upload Policy: Authenticated users can upload to guest/, prescriptions/, or uploads/
create policy "Allow authenticated upload to prescriptions bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'prescriptions' and
    auth.role() = 'authenticated' and
    (name like 'guest/%' or name like 'prescriptions/%' or name like 'uploads/%')
  );

drop policy if exists "Allow owner and authenticated read on prescriptions bucket" on storage.objects;
create policy "Allow owner and authenticated read on prescriptions bucket"
  on storage.objects for select
  using (
    bucket_id = 'prescriptions' and (
      auth.role() = 'service_role' or
      auth.uid() = owner or
      public.check_is_admin() = true or
      (
        auth.role() = 'authenticated' and
        exists (
          select 1 from public.prescriptions p
          where p.file_path = storage.objects.name
            and (
              p.user_id = auth.uid() or
              p.patient_id in (select id from public.patients where user_id = auth.uid())
            )
        )
      )
    )
  );

drop policy if exists "Allow owner delete on prescriptions bucket" on storage.objects;
create policy "Allow owner delete on prescriptions bucket"
  on storage.objects for delete
  using (
    bucket_id = 'prescriptions' and (
      auth.role() = 'service_role' or
      auth.uid() = owner or
      public.check_is_admin() = true
    )
  );

-- 6. HARDENED ONE-TIME BACKFILL (UNAMBIGUOUS MATCH ONLY)
do $$
declare
  u record;
  v_primary_patient_id uuid;
  v_guest_match_count int;
  v_single_guest_id uuid;
  v_phone_10 text;
begin
  for u in select id, phone from auth.users where phone is not null and length(public.clean_phone_10(phone)) >= 10 loop
    v_phone_10 := public.clean_phone_10(u.phone);

    -- 1. Check if patient already linked to this auth user with matching phone
    select id into v_primary_patient_id
    from public.patients
    where user_id = u.id
      and public.clean_phone_10(phone_e164) = v_phone_10
    order by created_at asc
    limit 1;

    -- 2. If no patient linked to user yet, check unlinked guest patients
    if v_primary_patient_id is null then
      select count(*)
      into v_guest_match_count
      from public.patients
      where user_id is null
        and public.clean_phone_10(phone_e164) = v_phone_10;

      -- Claim ONLY if EXACTLY ONE unlinked guest patient matches this phone
      if v_guest_match_count = 1 then
        select id into v_single_guest_id
        from public.patients
        where user_id is null
          and public.clean_phone_10(phone_e164) = v_phone_10
        limit 1;

        update public.patients
        set user_id = u.id,
            is_verified = true
        where id = v_single_guest_id
          and user_id is null;

        v_primary_patient_id := v_single_guest_id;
      elsif v_guest_match_count > 1 then
        raise notice 'Ambiguous guest patients found for phone %. Count: %. Skipping auto-claim for manual review.', v_phone_10, v_guest_match_count;
      end if;
    end if;

    -- 3. Re-link prescriptions & enquiries ONLY when primary patient matching phone exists
    if v_primary_patient_id is not null then
      update public.prescriptions
      set user_id = u.id, patient_id = v_primary_patient_id
      where (user_id is null or user_id = u.id)
        and patient_id in (
          select id from public.patients
          where (user_id is null and public.clean_phone_10(phone_e164) = v_phone_10)
             or (user_id = u.id and public.clean_phone_10(phone_e164) = v_phone_10)
        );

      update public.enquiries
      set patient_id = v_primary_patient_id
      where patient_id in (
        select id from public.patients
        where (user_id is null and public.clean_phone_10(phone_e164) = v_phone_10)
           or (user_id = u.id and public.clean_phone_10(phone_e164) = v_phone_10)
      );
    end if;
  end loop;

  update public.prescriptions p
  set user_id = pat.user_id
  from public.patients pat
  where p.patient_id = pat.id
    and p.user_id is null
    and pat.user_id is not null;
end $$;
