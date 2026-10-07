-- ============================================================
-- HEALTH EXPRESS — SUPABASE SQL MIGRATION
-- ENHANCE UNIFIED USER ACCOUNT LINKING TO INCLUDE ANALYTICS EVENTS
-- ============================================================

create or replace function public.link_guest_records_on_otp_login()
returns void as $$
declare
  current_user_id uuid := auth.uid();
  user_phone text;
  patient_rec_id uuid;
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

  -- 3. If phone is null or unconfirmed, still return safely
  if user_phone is null or length(trim(user_phone)) < 10 then
    return;
  end if;

  user_phone := trim(user_phone);

  -- 4. Link patient record to authenticated user ID
  update public.patients
  set user_id = current_user_id,
      is_verified = true,
      updated_at = now()
  where phone_e164 = user_phone
    and (user_id is null or user_id = current_user_id);

  select id into patient_rec_id
  from public.patients
  where user_id = current_user_id
  limit 1;

  -- 5. Link prescription records belonging to this patient
  update public.prescriptions
  set user_id = current_user_id
  where patient_id in (
    select id from public.patients where phone_e164 = user_phone
  ) and user_id is null;

  -- 6. Link order records belonging to this patient
  update public.orders
  set user_id = current_user_id
  where patient_id in (
    select id from public.patients where phone_e164 = user_phone
  ) and user_id is null;

  -- 7. Securely link anonymous analytics events belonging to this patient or phone
  if patient_rec_id is not null then
    update public.analytics_events
    set user_id = current_user_id,
        patient_id = patient_rec_id
    where user_id is null
      and (patient_id = patient_rec_id or session_id in (
        select session_id from public.analytics_events where patient_id = patient_rec_id
      ));
  end if;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.link_guest_records_on_otp_login() from public, anon;
grant execute on function public.link_guest_records_on_otp_login() to authenticated;
