-- ============================================================
-- HEALTH EXPRESS — SUPABASE SQL MIGRATION
-- SAFE ADMIN AUTH LINKING, RBAC HARDENING & RLS ENFORCEMENT
-- ============================================================

-- 1. Ensure is_admin column exists on public.patients
alter table public.patients add column if not exists is_admin boolean default false;

-- 2. Link auth user 'admin@healthexpress.in' to public.patients safely using PL/pgSQL
do $$
declare
  v_admin_auth_id uuid;
  v_patient_id uuid;
  v_phone text := '+910000000000';
begin
  -- Retrieve Auth User UUID for admin@healthexpress.in from auth.users
  select id into v_admin_auth_id
  from auth.users
  where lower(email) = 'admin@healthexpress.in'
  limit 1;

  if v_admin_auth_id is null then
    raise notice 'Admin auth user (admin@healthexpress.in) not found in auth.users. Please register/create user in Supabase Auth.';
    return;
  end if;

  -- Reset any unauthorized patient records that may have is_admin set to true
  update public.patients
  set is_admin = false
  where is_admin = true 
    and (user_id is null or user_id != v_admin_auth_id or lower(email) != 'admin@healthexpress.in');

  -- Check if a patient record already exists for this admin auth user or email
  select id into v_patient_id
  from public.patients
  where user_id = v_admin_auth_id or lower(email) = 'admin@healthexpress.in'
  limit 1;

  if v_patient_id is not null then
    -- UPDATE existing patient record without touching phone_e164
    update public.patients
    set user_id = v_admin_auth_id,
        full_name = 'Health Express Admin',
        email = 'admin@healthexpress.in',
        is_admin = true,
        is_verified = true,
        updated_at = now()
    where id = v_patient_id;
  else
    -- Find a unique phone_e164 placeholder that does NOT collide with any existing patient
    while exists (select 1 from public.patients where phone_e164 = v_phone) loop
      v_phone := '+91' || lpad((cast(substring(v_phone from 4) as bigint) + 1)::text, 10, '0');
    end loop;

    -- INSERT new patient record with guaranteed unique phone_e164
    insert into public.patients (
      user_id,
      full_name,
      email,
      phone_e164,
      is_admin,
      is_verified,
      city
    ) values (
      v_admin_auth_id,
      'Health Express Admin',
      'admin@healthexpress.in',
      v_phone,
      true,
      true,
      'Bengaluru'
    );
  end if;
end;
$$;

-- 3. HARDENED check_is_admin() RPC FUNCTION
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

  return coalesce(v_is_admin, false);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.check_is_admin() from public;
grant execute on function public.check_is_admin() to authenticated, anon;

-- 4. HARDENED mark_cod_payment_collected(uuid) RPC FUNCTION
create or replace function public.mark_cod_payment_collected(
  p_order_id uuid
) returns jsonb as $$
declare
  v_order public.orders%rowtype;
  v_is_admin boolean := false;
begin
  -- Require authenticated session
  if auth.uid() is null then
    raise exception 'Unauthorized: Must be logged in to collect COD payment.';
  end if;

  -- Require admin role via check_is_admin()
  v_is_admin := public.check_is_admin();
  if not v_is_admin then
    raise exception 'Forbidden: Only Health Express Admin accounts can mark COD payments as collected.';
  end if;

  -- Find order
  select * into v_order
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'Order not found with ID %', p_order_id;
  end if;

  -- Update payment record
  update public.payments
  set payment_status = 'PAID',
      payment_method = 'COD',
      updated_at = now()
  where order_id = p_order_id;

  -- Update order record
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

-- Revoke from anon & public. Grant strictly to authenticated role.
revoke execute on function public.mark_cod_payment_collected(uuid) from public, anon;
grant execute on function public.mark_cod_payment_collected(uuid) to authenticated;

-- 5. HARDEN RLS UPDATE POLICIES FOR ORDERS, PAYMENTS, AND ENQUIRIES
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "Only admin can update orders" on public.orders;
create policy "Only admin can update orders" on public.orders
  for update using (
    public.check_is_admin() = true
  );

drop policy if exists "Only admin can update payments" on public.payments;
create policy "Only admin can update payments" on public.payments
  for update using (
    public.check_is_admin() = true
  );

drop policy if exists "Only admin can update enquiries" on public.enquiries;
create policy "Only admin can update enquiries" on public.enquiries
  for update using (
    public.check_is_admin() = true
  );
