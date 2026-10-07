-- ============================================================
-- HEALTH EXPRESS — SUPABASE PRODUCTION SECURITY MIGRATION
-- P0 FIX: PRESCRIPTION STORAGE BUCKET RLS OWNERSHIP ISOLATION
-- ============================================================

-- 1. DROP OVERLY BROAD STORAGE SELECT POLICY
drop policy if exists "Allow authorized user access to prescriptions" on storage.objects;
drop policy if exists "Users can view own prescription storage objects" on storage.objects;
drop policy if exists "Users can update own prescription storage objects" on storage.objects;
drop policy if exists "Users can delete own prescription storage objects" on storage.objects;
drop policy if exists "Admins can view all prescription files" on storage.objects;

-- 2. CREATE STRICT OWNERSHIP-BASED SELECT POLICY ON STORAGE OBJECTS
-- Authorizes access ONLY if:
--   a) Caller is service_role
--   b) Caller is verified admin (via check_is_admin())
--   c) Object path (name) matches a record in public.prescriptions belonging to auth.uid() or auth.uid()'s patient profile
create policy "Users can view own prescription storage objects" on storage.objects
  for select using (
    bucket_id = 'prescriptions' and (
      auth.role() = 'service_role' or
      public.check_is_admin() = true or
      exists (
        select 1 from public.prescriptions p
        where p.file_path = storage.objects.name
          and (
            p.user_id = auth.uid() or
            p.patient_id in (select id from public.patients where user_id = auth.uid())
          )
      )
    )
  );

-- 3. CREATE STRICT OWNERSHIP-BASED UPDATE POLICY ON STORAGE OBJECTS
create policy "Users can update own prescription storage objects" on storage.objects
  for update using (
    bucket_id = 'prescriptions' and (
      auth.role() = 'service_role' or
      public.check_is_admin() = true or
      exists (
        select 1 from public.prescriptions p
        where p.file_path = storage.objects.name
          and (
            p.user_id = auth.uid() or
            p.patient_id in (select id from public.patients where user_id = auth.uid())
          )
      )
    )
  );

-- 4. CREATE STRICT OWNERSHIP-BASED DELETE POLICY ON STORAGE OBJECTS
create policy "Users can delete own prescription storage objects" on storage.objects
  for delete using (
    bucket_id = 'prescriptions' and (
      auth.role() = 'service_role' or
      public.check_is_admin() = true or
      exists (
        select 1 from public.prescriptions p
        where p.file_path = storage.objects.name
          and (
            p.user_id = auth.uid() or
            p.patient_id in (select id from public.patients where user_id = auth.uid())
          )
      )
    )
  );

-- 5. VERIFY & HARDEN DATABASE RLS POLICIES ON CORE TABLES FOR DATA ISOLATION
alter table public.patients enable row level security;
alter table public.enquiries enable row level security;
alter table public.prescriptions enable row level security;

-- Prescriptions SELECT RLS Policy
drop policy if exists "Users can view own prescriptions" on public.prescriptions;
create policy "Users can view own prescriptions" on public.prescriptions
  for select using (
    public.check_is_admin() = true or
    auth.uid() = user_id or
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

-- Enquiries SELECT RLS Policy
drop policy if exists "Users can view own enquiries" on public.enquiries;
create policy "Users can view own enquiries" on public.enquiries
  for select using (
    public.check_is_admin() = true or
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

-- Patients SELECT RLS Policy
drop policy if exists "Users can view own patient profile" on public.patients;
create policy "Users can view own patient profile" on public.patients
  for select using (
    public.check_is_admin() = true or
    (auth.uid() is not null and auth.uid() = user_id)
  );
