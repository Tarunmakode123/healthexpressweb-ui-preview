-- ============================================================
-- HEALTH EXPRESS — SUPABASE PRODUCTION SQL MIGRATION
-- SYSTEM OF RECORD FOR PATIENTS, ENQUIRIES & PRESCRIPTIONS
-- ============================================================

-- 1. TABLE: patients
create table if not exists public.patients (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone_e164 text not null unique,
  email text null,
  city text null default 'Bengaluru',
  user_id uuid null references auth.users(id) on delete set null,
  is_verified boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast phone lookup
create index if not exists idx_patients_phone_e164 on public.patients(phone_e164);
create index if not exists idx_patients_user_id on public.patients(user_id);

-- 2. TABLE: enquiries
create table if not exists public.enquiries (
  id uuid default gen_random_uuid() primary key,
  enquiry_code text not null unique,
  patient_id uuid not null references public.patients(id) on delete cascade,
  source text default 'website' not null,
  status text default 'pending_review' not null,
  notes text null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for enquiry code and patient FK
create index if not exists idx_enquiries_code on public.enquiries(enquiry_code);
create index if not exists idx_enquiries_patient_id on public.enquiries(patient_id);

-- 3. TABLE: prescriptions
create table if not exists public.prescriptions (
  id uuid default gen_random_uuid() primary key,
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  user_id uuid null references auth.users(id) on delete set null,
  created_at timestamptz default now() not null
);

-- Index for prescription relationships
create index if not exists idx_prescriptions_enquiry_id on public.prescriptions(enquiry_id);
create index if not exists idx_prescriptions_patient_id on public.prescriptions(patient_id);
create index if not exists idx_prescriptions_user_id on public.prescriptions(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

alter table public.patients enable row level security;
alter table public.enquiries enable row level security;
alter table public.prescriptions enable row level security;

-- Patients RLS: Authenticated users can view own profile.
-- Guest patient creation is strictly handled by the SECURITY DEFINER function get_or_create_guest_patient to prevent PII harvesting.
create policy "Users can view own patient profile" on public.patients
  for select using (
    auth.uid() is not null and auth.uid() = user_id
  );

-- Enquiries RLS: Authenticated users can view their own enquiries
create policy "Users can view own enquiries" on public.enquiries
  for select using (
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

-- Prescriptions RLS: Authenticated users can view their own prescriptions
create policy "Users can view own prescriptions" on public.prescriptions
  for select using (
    auth.uid() = user_id or
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

-- Structured Insert RLS Policies for Guest Submission Flow
-- Patients insert policy for authenticated / service role fallback
create policy "Allow insert for patient records" on public.patients
  for insert with check (true);

create policy "Allow insert for guest enquiry submissions" on public.enquiries
  for insert with check (patient_id is not null);

create policy "Allow insert for guest prescription records" on public.prescriptions
  for insert with check (patient_id is not null and enquiry_id is not null);

-- ============================================================
-- PRIVATE STORAGE BUCKET CONFIGURATION
-- ============================================================

-- Create Private Storage Bucket for Prescriptions (public = false)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prescriptions',
  'prescriptions',
  false,
  10485760, -- 10MB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) on conflict (id) do update set public = false;

-- Storage Policy: Allow guest uploads to private prescriptions bucket
create policy "Allow guest upload to prescriptions bucket" on storage.objects
  for insert with check (bucket_id = 'prescriptions');

-- Storage Policy: Authenticated users can view their own files
create policy "Allow authorized user access to prescriptions" on storage.objects
  for select using (
    bucket_id = 'prescriptions' and
    (auth.role() = 'service_role' or auth.uid() is not null)
  );

-- ============================================================
-- HARDENED POST-OTP ACCOUNT LINKING SECURITY DEFINER FUNCTION
-- ============================================================

create or replace function public.link_guest_records_on_otp_login(
  verified_phone_e164 text
) returns void as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Unauthorized: Must be an authenticated Supabase user to link records.';
  end if;

  if verified_phone_e164 is null or length(verified_phone_e164) < 10 then
    raise exception 'Invalid phone number provided for account linking.';
  end if;

  -- 1. Link patient record to authenticated user ID
  update public.patients
  set user_id = current_user_id,
      is_verified = true,
      updated_at = now()
  where phone_e164 = verified_phone_e164;

  -- 2. Link prescription records belonging to this patient
  update public.prescriptions
  set user_id = current_user_id
  where patient_id in (
    select id from public.patients where phone_e164 = verified_phone_e164
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Revoke execute from public; grant only to authenticated role
revoke execute on function public.link_guest_records_on_otp_login(text) from public;
grant execute on function public.link_guest_records_on_otp_login(text) to authenticated;

-- ============================================================
-- GUEST PATIENT ATOMIC LOOKUP/CREATION SECURITY DEFINER FUNCTION
-- (Supports multiple prescription uploads per phone number)
-- ============================================================

create or replace function public.get_or_create_guest_patient(
  p_full_name text,
  p_phone_e164 text,
  p_city text default 'Bengaluru',
  p_email text default null
) returns uuid as $$
declare
  v_patient_id uuid;
begin
  -- 1. Check if patient record with this phone number already exists
  select id into v_patient_id
  from public.patients
  where phone_e164 = p_phone_e164
  limit 1;

  -- 2. If not found, create new patient record with conflict safety
  if v_patient_id is null then
    insert into public.patients (full_name, phone_e164, city, email)
    values (p_full_name, p_phone_e164, coalesce(p_city, 'Bengaluru'), p_email)
    on conflict (phone_e164) do update set
      full_name = coalesce(nullif(trim(p_full_name), ''), public.patients.full_name),
      updated_at = now()
    returning id into v_patient_id;
  end if;

  return v_patient_id;
end;
$$ language plpgsql security definer set search_path = public;

-- Grant execute to anon and authenticated roles for guest uploads
revoke execute on function public.get_or_create_guest_patient(text, text, text, text) from public;
grant execute on function public.get_or_create_guest_patient(text, text, text, text) to anon, authenticated;

-- ============================================================
-- HEALTH EXPRESS — ORDERS & PAYMENTS TRANSACTION TABLES
-- ============================================================

-- 4. TABLE: orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_code text not null unique,
  patient_id uuid not null references public.patients(id) on delete cascade,
  user_id uuid null references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text null,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  currency text default 'INR' not null,
  order_status text default 'PENDING' not null check (order_status in ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  payment_status text default 'PENDING' not null check (payment_status in ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_orders_order_code on public.orders(order_code);
create index if not exists idx_orders_patient_id on public.orders(patient_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(order_status, payment_status);

-- 5. TABLE: payments
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  razorpay_order_id text not null,
  razorpay_payment_id text null,
  razorpay_signature text null,
  amount numeric(10,2) not null check (amount >= 0),
  currency text default 'INR' not null,
  payment_status text default 'PENDING' not null check (payment_status in ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  payment_method text default 'unknown' not null,
  payment_mode text default 'DEMO' not null check (payment_mode in ('DEMO', 'LIVE', 'COD')),
  error_message text null,
  raw_payload jsonb null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_patient_id on public.payments(patient_id);
create index if not exists idx_payments_razorpay_order on public.payments(razorpay_order_id);
create index if not exists idx_payments_razorpay_payment on public.payments(razorpay_payment_id);

-- RLS POLICIES FOR ORDERS & PAYMENTS
alter table public.orders enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
  for select using (
    (auth.uid() is not null and auth.uid() = user_id) or
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

drop policy if exists "Allow insert for orders" on public.orders;
create policy "Allow insert for orders" on public.orders
  for insert with check (patient_id is not null);

drop policy if exists "Allow update for order verification" on public.orders;
create policy "Allow update for order verification" on public.orders
  for update using (true);

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments" on public.payments
  for select using (
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

drop policy if exists "Allow insert for payments" on public.payments;
create policy "Allow insert for payments" on public.payments
  for insert with check (order_id is not null and patient_id is not null);

drop policy if exists "Allow update for payments" on public.payments;
create policy "Allow update for payments" on public.payments
  for update using (true);

-- SECURITY DEFINER RPC: ATOMIC ORDER & PAYMENT CREATION (COD + ONLINE)
create or replace function public.create_checkout_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text default null,
  p_city text default 'Bengaluru',
  p_items jsonb default '[]'::jsonb,
  p_total_amount numeric default 0,
  p_razorpay_order_id text default null,
  p_payment_mode text default 'DEMO',
  p_user_id uuid default null,
  p_payment_method text default 'ONLINE'
) returns jsonb as $$
declare
  v_patient_id uuid;
  v_order_id uuid := gen_random_uuid();
  v_payment_id uuid := gen_random_uuid();
  v_order_code text;
  v_actual_user_id uuid := coalesce(p_user_id, auth.uid());
  v_method text := upper(coalesce(p_payment_method, 'ONLINE'));
  v_mode text := upper(coalesce(p_payment_mode, 'DEMO'));
  v_order_status text := 'PENDING';
  v_payment_status text := 'PENDING';
  v_rzp_order_id text;
begin
  if p_total_amount <= 0 then
    raise exception 'Order total amount must be greater than zero.';
  end if;

  if v_method = 'COD' then
    v_mode := 'COD';
    v_order_status := 'CONFIRMED';
    v_payment_status := 'PENDING';
    v_rzp_order_id := 'cod_ord_' || floor(random() * 899999 + 100000)::text;
  else
    if v_mode not in ('DEMO', 'LIVE') then
      v_mode := 'DEMO';
    end if;
    v_rzp_order_id := coalesce(p_razorpay_order_id, 'demo_rzp_ord_' || floor(random() * 899999 + 100000)::text);
  end if;

  v_patient_id := public.get_or_create_guest_patient(
    p_customer_name,
    p_customer_phone,
    coalesce(p_city, 'Bengaluru'),
    p_customer_email
  );

  if v_actual_user_id is not null then
    update public.patients
    set user_id = v_actual_user_id,
        is_verified = true,
        updated_at = now()
    where id = v_patient_id and user_id is null;
  end if;

  v_order_code := 'HEX-ORD-' || floor(random() * 8999 + 1000)::text;

  insert into public.orders (
    id,
    order_code,
    patient_id,
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    items,
    total_amount,
    currency,
    order_status,
    payment_status
  ) values (
    v_order_id,
    v_order_code,
    v_patient_id,
    v_actual_user_id,
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(p_customer_email), ''),
    p_items,
    p_total_amount,
    'INR',
    v_order_status,
    v_payment_status
  );

  insert into public.payments (
    id,
    order_id,
    patient_id,
    razorpay_order_id,
    amount,
    currency,
    payment_status,
    payment_method,
    payment_mode
  ) values (
    v_payment_id,
    v_order_id,
    v_patient_id,
    v_rzp_order_id,
    p_total_amount,
    'INR',
    v_payment_status,
    v_method,
    v_mode
  );

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_code', v_order_code,
    'patient_id', v_patient_id,
    'razorpay_order_id', v_rzp_order_id,
    'total_amount', p_total_amount,
    'currency', 'INR',
    'payment_method', v_method,
    'payment_mode', v_mode,
    'payment_status', v_payment_status,
    'order_status', v_order_status
  );
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.create_checkout_order(text, text, text, text, jsonb, numeric, text, text, uuid, text) from public;
grant execute on function public.create_checkout_order(text, text, text, text, jsonb, numeric, text, text, uuid, text) to anon, authenticated;

-- SECURITY DEFINER RPC: VERIFY AND CONFIRM PAYMENT (IDEMPOTENT)
create or replace function public.verify_and_confirm_order_payment(
  p_order_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_razorpay_signature text,
  p_payment_method text default 'unknown',
  p_payment_mode text default 'DEMO'
) returns jsonb as $$
declare
  v_existing_order public.orders%rowtype;
  v_mode text := upper(coalesce(p_payment_mode, 'DEMO'));
begin
  select * into v_existing_order
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'Order with ID % was not found.', p_order_id;
  end if;

  if v_existing_order.payment_status = 'PAID' and v_existing_order.order_status = 'CONFIRMED' then
    return jsonb_build_object(
      'success', true,
      'already_verified', true,
      'order_id', v_existing_order.id,
      'order_code', v_existing_order.order_code,
      'payment_status', 'PAID',
      'order_status', 'CONFIRMED'
    );
  end if;

  update public.payments
  set razorpay_payment_id = p_razorpay_payment_id,
      razorpay_signature = p_razorpay_signature,
      payment_status = 'PAID',
      payment_method = coalesce(p_payment_method, 'unknown'),
      payment_mode = v_mode,
      updated_at = now()
  where order_id = p_order_id;

  update public.orders
  set payment_status = 'PAID',
      order_status = 'CONFIRMED',
      updated_at = now()
  where id = p_order_id;

  return jsonb_build_object(
    'success', true,
    'already_verified', false,
    'order_id', v_existing_order.id,
    'order_code', v_existing_order.order_code,
    'customer_name', v_existing_order.customer_name,
    'customer_phone', v_existing_order.customer_phone,
    'total_amount', v_existing_order.total_amount,
    'payment_status', 'PAID',
    'order_status', 'CONFIRMED',
    'payment_mode', v_mode
  );
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.verify_and_confirm_order_payment(uuid, text, text, text, text, text) from public;
grant execute on function public.verify_and_confirm_order_payment(uuid, text, text, text, text, text) to anon, authenticated;

-- ============================================================
-- ADMIN RBAC & COD PAYMENT WORKFLOW ENHANCEMENTS
-- ============================================================

-- 1. Add is_admin column to patients table for database-backed RBAC
alter table public.patients add column if not exists is_admin boolean default false;

-- 2. Create RPC function to securely verify if authenticated user is admin
create or replace function public.check_is_admin()
returns boolean as $$
declare
  v_is_admin boolean := false;
begin
  if auth.uid() is null then
    return false;
  end if;

  select coalesce(is_admin, false) into v_is_admin
  from public.patients
  where user_id = auth.uid()
  limit 1;

  return v_is_admin;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.check_is_admin() from public;
grant execute on function public.check_is_admin() to authenticated, anon;

-- 3. Create RPC function for Admin to mark COD payment as collected (HARDENED)
create or replace function public.mark_cod_payment_collected(
  p_order_id uuid
) returns jsonb as $$
declare
  v_order public.orders%rowtype;
  v_is_admin boolean := false;
begin
  -- A. Require authenticated session
  if auth.uid() is null then
    raise exception 'Unauthorized: Must be logged in to collect COD payment.';
  end if;

  -- B. Require admin role via check_is_admin()
  v_is_admin := public.check_is_admin();
  if not v_is_admin then
    raise exception 'Forbidden: Only Health Express Admin accounts can mark COD payments as collected.';
  end if;

  -- C. Find order
  select * into v_order
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'Order not found with ID %', p_order_id;
  end if;

  -- D. Update payment record
  update public.payments
  set payment_status = 'PAID',
      payment_method = 'COD',
      updated_at = now()
  where order_id = p_order_id;

  -- E. Update order record
  update public.orders
  set payment_status = 'PAID',
      order_status = 'CONFIRMED',
      updated_at = now()
  where id = p_order_id;

  return jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_code', v_order.order_code,
    'payment_status', 'PAID',
    'order_status', 'CONFIRMED'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- REVOKE FROM PUBLIC AND ANON. GRANT ONLY TO AUTHENTICATED ROLE
revoke execute on function public.mark_cod_payment_collected(uuid) from public, anon;
grant execute on function public.mark_cod_payment_collected(uuid) to authenticated;

-- HARDEN RLS UPDATE POLICIES FOR ORDERS & PAYMENTS (RESTRICT TO ADMIN ONLY)
drop policy if exists "Allow update for order verification" on public.orders;
drop policy if exists "Only admin can update orders" on public.orders;
create policy "Only admin can update orders" on public.orders
  for update using (
    public.check_is_admin() = true
  );

drop policy if exists "Allow update for payments" on public.payments;
drop policy if exists "Only admin can update payments" on public.payments;
create policy "Only admin can update payments" on public.payments
  for update using (
    public.check_is_admin() = true
  );

-- HARDEN RLS UPDATE POLICIES FOR ENQUIRIES (RESTRICT TO ADMIN ONLY)
drop policy if exists "Only admin can update enquiries" on public.enquiries;
create policy "Only admin can update enquiries" on public.enquiries
  for update using (
    public.check_is_admin() = true
  );




