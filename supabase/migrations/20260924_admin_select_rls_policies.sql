-- ============================================================
-- HEALTH EXPRESS — SUPABASE MIGRATION
-- ADMIN RLS SELECT POLICIES FOR TELEMETRY & MANAGEMENT DASHBOARD
-- ============================================================

-- 1. Enable Row Level Security (RLS) on all production tables
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.patients enable row level security;
alter table public.enquiries enable row level security;
alter table public.prescriptions enable row level security;

-- 2. ORDERS RLS SELECT POLICY FOR ADMINS
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders
  for select using (
    public.check_is_admin() = true
  );

-- 3. PAYMENTS RLS SELECT POLICY FOR ADMINS
drop policy if exists "Admins can view all payments" on public.payments;
create policy "Admins can view all payments" on public.payments
  for select using (
    public.check_is_admin() = true
  );

-- 4. PATIENTS RLS SELECT POLICY FOR ADMINS
drop policy if exists "Admins can view all patients" on public.patients;
create policy "Admins can view all patients" on public.patients
  for select using (
    public.check_is_admin() = true
  );

-- 5. ENQUIRIES RLS SELECT POLICY FOR ADMINS
drop policy if exists "Admins can view all enquiries" on public.enquiries;
create policy "Admins can view all enquiries" on public.enquiries
  for select using (
    public.check_is_admin() = true
  );

-- 6. PRESCRIPTIONS RLS SELECT POLICY FOR ADMINS
drop policy if exists "Admins can view all prescriptions" on public.prescriptions;
create policy "Admins can view all prescriptions" on public.prescriptions
  for select using (
    public.check_is_admin() = true
  );
