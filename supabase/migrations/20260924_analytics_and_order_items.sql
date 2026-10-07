-- ============================================================
-- HEALTH EXPRESS — SUPABASE MIGRATION
-- ANALYTICS EVENTS, ORDER ITEMS & BACKEND OPERATIONAL ENHANCEMENTS
-- ============================================================

-- 1. TABLE: analytics_events
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_id text null,
  session_id text null,
  user_id uuid null references auth.users(id) on delete set null,
  patient_id uuid null references public.patients(id) on delete set null,
  event_type text not null,
  page_path text null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

create index if not exists idx_analytics_events_type on public.analytics_events(event_type);
create index if not exists idx_analytics_events_user on public.analytics_events(user_id);
create index if not exists idx_analytics_events_patient on public.analytics_events(patient_id);
create index if not exists idx_analytics_events_created on public.analytics_events(created_at);

-- 2. TABLE: order_items
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text null,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_price numeric(10,2) not null check (total_price >= 0),
  created_at timestamptz default now() not null
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- 3. ENABLE RLS
alter table public.analytics_events enable row level security;
alter table public.order_items enable row level security;

-- 4. RLS POLICIES FOR ANALYTICS EVENTS
drop policy if exists "Admins can view all analytics events" on public.analytics_events;
create policy "Admins can view all analytics events" on public.analytics_events
  for select using (
    public.check_is_admin() = true
  );

drop policy if exists "Allow insert for analytics events" on public.analytics_events;
create policy "Allow insert for analytics events" on public.analytics_events
  for insert with check (true);

-- 5. RLS POLICIES FOR ORDER ITEMS
drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items" on public.order_items
  for select using (
    public.check_is_admin() = true
  );

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items
  for select using (
    order_id in (select id from public.orders where user_id = auth.uid())
  );

drop policy if exists "Allow insert for order items" on public.order_items;
create policy "Allow insert for order items" on public.order_items
  for insert with check (order_id is not null);

-- 6. UPDATE RPC create_checkout_order TO POPULATE order_items ACCURATELY
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
  v_item jsonb;
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
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_items,
    p_total_amount,
    'INR',
    v_order_status,
    v_payment_status
  );

  -- 4. Insert structured order_items records
  if jsonb_array_length(p_items) > 0 then
    for v_item in select * from jsonb_array_elements(p_items) loop
      insert into public.order_items (
        order_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price
      ) values (
        v_order_id,
        coalesce(v_item->>'id', 'service'),
        coalesce(v_item->>'name', 'Healthcare Service'),
        coalesce((v_item->>'quantity')::integer, 1),
        coalesce((v_item->>'unit_price')::numeric, (v_item->>'total_price')::numeric, 0),
        coalesce((v_item->>'total_price')::numeric, 0)
      );
    end loop;
  end if;

  -- 5. Insert payment record
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
    'success', true,
    'order_id', v_order_id,
    'payment_id', v_payment_id,
    'order_code', v_order_code,
    'patient_id', v_patient_id,
    'razorpay_order_id', v_rzp_order_id,
    'total_amount', p_total_amount,
    'payment_mode', v_mode,
    'payment_method', v_method,
    'order_status', v_order_status,
    'payment_status', v_payment_status
  );
end;
$$ language plpgsql security definer set search_path = public;
