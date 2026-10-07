-- ============================================================
-- HEALTH EXPRESS — SUPABASE SQL MIGRATION
-- HARDENED UNIFIED USER ACCOUNT LINKING (ZERO-ARGUMENT SERVER DERIVED & VERIFIED PHONE ONLY)
-- ============================================================

-- Drop old parameterized function signatures to avoid overload confusion
drop function if exists public.link_guest_records_on_otp_login(text);

-- Create hardened zero-argument RPC function requiring confirmed phone status
create or replace function public.link_guest_records_on_otp_login()
returns void as $$
declare
  current_user_id uuid := auth.uid();
  user_phone text;
begin
  -- 1. Require authenticated Supabase session
  if current_user_id is null then
    raise exception 'Unauthorized: Must be an authenticated Supabase user to link records.';
  end if;

  -- 2. Extract phone number directly from auth.users for auth.uid() ONLY if phone is OTP confirmed
  select phone into user_phone
  from auth.users
  where id = current_user_id
    and phone_confirmed_at is not null;

  -- 3. If phone is null, empty, or unconfirmed (e.g. unverified phone or email-only account), return safely
  if user_phone is null or length(trim(user_phone)) < 10 then
    return;
  end if;

  user_phone := trim(user_phone);

  -- 4. Link patient record to authenticated user ID (ONLY if user_id IS NULL or equals current_user_id)
  update public.patients
  set user_id = current_user_id,
      is_verified = true,
      updated_at = now()
  where phone_e164 = user_phone
    and (user_id is null or user_id = current_user_id);

  -- 5. Link prescription records belonging to this patient (ONLY if prescription user_id IS NULL)
  update public.prescriptions
  set user_id = current_user_id
  where patient_id in (
    select id from public.patients where phone_e164 = user_phone
  ) and user_id is null;

  -- 6. Link order records belonging to this patient (ONLY if order user_id IS NULL)
  update public.orders
  set user_id = current_user_id
  where patient_id in (
    select id from public.patients where phone_e164 = user_phone
  ) and user_id is null;
end;
$$ language plpgsql security definer set search_path = public;

-- Revoke from public & anon; grant strictly to authenticated role
revoke execute on function public.link_guest_records_on_otp_login() from public, anon;
grant execute on function public.link_guest_records_on_otp_login() to authenticated;

-- HARDEN STORAGE RLS POLICY FOR PRIVATE PRESCRIPTIONS BUCKET
drop policy if exists "Allow authorized user access to prescriptions" on storage.objects;

create policy "Allow authorized user access to prescriptions" on storage.objects
  for select using (
    bucket_id = 'prescriptions' and (
      auth.role() = 'service_role' or
      public.check_is_admin() = true or
      (auth.uid() is not null and exists (
        select 1 from public.prescriptions
        where file_path = storage.objects.name
          and (user_id = auth.uid() or patient_id in (select id from public.patients where user_id = auth.uid()))
      ))
    )
  );
