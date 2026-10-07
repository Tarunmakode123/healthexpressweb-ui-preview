-- ============================================================
-- HEALTH EXPRESS — SUPABASE PRODUCTION SQL MIGRATION
-- FIX: GUEST PRESCRIPTION SUBMISSION DUPLICATE PHONE CONSTRAINT (23505)
-- ============================================================

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
    -- Authenticated callers allow guest/, prescriptions/, uploads/, or temp/
    if p_file_path not like 'guest/%' and p_file_path not like 'prescriptions/%' and p_file_path not like 'uploads/%' and p_file_path not like 'temp/%' then
      raise exception 'Invalid file path prefix. Path must start with guest/, prescriptions/, or uploads/.';
    end if;
  end if;

  -- Input Validation 4: File Type / MIME validation
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

  -- Generate Server-Side Enquiry Code
  if p_enquiry_code is not null and trim(p_enquiry_code) <> '' then
    v_code := trim(p_enquiry_code);
  else
    v_code := 'HE-2026-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
  end if;

  -- A. Patient Creation / Lookup
  if v_current_user_id is not null then
    -- AUTHENTICATED CALLER:
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

    if length(v_auth_phone_10) < 10 then
      raise exception 'Access denied. Authenticated user profile does not have a verified 10-digit phone number.';
    end if;

    if v_clean_phone_10 <> v_auth_phone_10 then
      raise exception 'Access denied. Authenticated user phone (%) does not match submitted phone (%).', v_auth_user_phone, p_phone_e164;
    end if;

    -- Look up existing patient row
    select id into v_patient_id
    from public.patients
    where public.clean_phone_10(phone_e164) = v_auth_phone_10
    order by (case when user_id = v_current_user_id then 1 else 2 end), created_at desc
    limit 1;

    if v_patient_id is not null then
      update public.patients
      set user_id = coalesce(user_id, v_current_user_id),
          full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
          city = coalesce(nullif(trim(p_city), ''), city),
          email = coalesce(nullif(trim(p_email), ''), email),
          is_verified = true,
          updated_at = now()
      where id = v_patient_id;
    else
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
    -- UNAUTHENTICATED GUEST CALLER:
    -- Find existing patient record for this 10-digit phone number
    select id into v_patient_id
    from public.patients
    where public.clean_phone_10(phone_e164) = v_clean_phone_10
    order by (case when user_id is null then 1 else 2 end), created_at desc
    limit 1;

    if v_patient_id is not null then
      update public.patients
      set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
          city = coalesce(nullif(trim(p_city), ''), city),
          email = coalesce(nullif(trim(p_email), ''), email),
          updated_at = now()
      where id = v_patient_id;
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

  -- B. Atomic Enquiry Insertion
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
    p_notes
  );

  -- C. Atomic Prescription Metadata Insertion
  insert into public.prescriptions (
    id,
    enquiry_id,
    patient_id,
    user_id,
    file_path,
    file_name,
    file_type,
    file_size
  ) values (
    v_prescription_id,
    v_enquiry_id,
    v_patient_id,
    v_current_user_id,
    p_file_path,
    p_file_name,
    p_file_type,
    p_file_size
  );

  -- Return Success Payload
  return jsonb_build_object(
    'success', true,
    'enquiry_id', v_enquiry_id,
    'enquiry_code', v_code,
    'patient_id', v_patient_id,
    'prescription_id', v_prescription_id,
    'file_path', p_file_path
  );
exception when others then
  return jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'code', SQLSTATE
  );
end;
$$;

grant execute on function public.submit_guest_prescription_secure(text, text, text, text, text, text, text, text, bigint, text) to anon, authenticated, service_role;
