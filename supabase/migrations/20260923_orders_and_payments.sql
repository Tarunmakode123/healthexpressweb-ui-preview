-- ============================================================
-- HEALTH EXPRESS — SUPABASE MIGRATION
-- ORDERS & PAYMENTS TRANSACTION TABLES + RPC PROCEDURES (COD + ONLINE)
-- ============================================================

-- 1. TABLE: orders
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

-- 2. TABLE: payments
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

-- ROW LEVEL SECURITY (RLS) POLICIES
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

-- ============================================================
-- SECURITY DEFINER RPC: ATOMIC ORDER & PAYMENT CREATION (COD + ONLINE)
-- ============================================================

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

  -- 1. Re-use or create patient record
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

  -- 2. Generate unique order code
  v_order_code := 'HEX-ORD-' || floor(random() * 8999 + 1000)::text;

  -- 3. Insert order record
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

  -- 4. Insert payment record
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
