-- ============================================================
-- HEALTH EXPRESS — HEALTH COINS / WALLET REWARDS SYSTEM
-- Production-Ready Database Migration with Idempotent Payment/Refund RPCs
-- ============================================================

-- 1. TABLE: public.wallet_accounts
create table if not exists public.wallet_accounts (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid not null unique references public.patients(id) on delete cascade,
  coin_balance numeric default 0 not null check (coin_balance >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_wallet_accounts_patient_id on public.wallet_accounts(patient_id);

-- 2. TABLE: public.wallet_transactions
create table if not exists public.wallet_transactions (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid not null references public.wallet_accounts(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('signup_reward', 'earned', 'redeemed', 'refund', 'admin_credit', 'admin_debit', 'adjustment', 'expiry')),
  coins numeric not null,
  balance_before numeric not null check (balance_before >= 0),
  balance_after numeric not null check (balance_after >= 0),
  reference_type text null,
  reference_id text null,
  description text null,
  expires_at timestamptz null,
  created_at timestamptz default now() not null
);

create index if not exists idx_wallet_tx_patient_id on public.wallet_transactions(patient_id);
create index if not exists idx_wallet_tx_wallet_id on public.wallet_transactions(wallet_id);
create index if not exists idx_wallet_tx_reference on public.wallet_transactions(reference_id, reference_type);

-- IDEMPOTENCY UNIQUE INDEXES
-- Prevents duplicate signup rewards per patient
create unique index if not exists idx_wallet_signup_reward on public.wallet_transactions(patient_id) where (transaction_type = 'signup_reward');
-- Prevents duplicate coin redemptions per order
create unique index if not exists idx_wallet_redeemed_order on public.wallet_transactions(reference_id) where (transaction_type = 'redeemed');
-- Prevents duplicate coin refunds per order
create unique index if not exists idx_wallet_refund_order on public.wallet_transactions(reference_id) where (transaction_type = 'refund');

-- 3. TABLE: public.wallet_settings
create table if not exists public.wallet_settings (
  id uuid default gen_random_uuid() primary key,
  signup_reward_enabled boolean default true not null,
  signup_reward_coins numeric default 1000 not null check (signup_reward_coins >= 0),
  coins_per_rupee numeric default 10 not null check (coins_per_rupee > 0),
  minimum_coins_to_redeem numeric default 100 not null check (minimum_coins_to_redeem >= 0),
  maximum_coins_per_order numeric default 500 not null check (maximum_coins_per_order >= 0),
  minimum_order_amount numeric default 299 not null check (minimum_order_amount >= 0),
  allow_stacking_with_promo boolean default true not null,
  coin_expiry_enabled boolean default false not null,
  default_expiry_days integer default 90 not null check (default_expiry_days > 0),
  redemption_enabled boolean default true not null,
  applicable_scope text default 'all' not null check (applicable_scope in ('all', 'categories', 'items')),
  applicable_categories jsonb default '[]'::jsonb not null,
  applicable_items jsonb default '[]'::jsonb not null,
  updated_at timestamptz default now() not null
);

-- Seed initial single configuration row if not present
insert into public.wallet_settings (
  signup_reward_enabled, signup_reward_coins, coins_per_rupee,
  minimum_coins_to_redeem, maximum_coins_per_order, minimum_order_amount,
  allow_stacking_with_promo, coin_expiry_enabled, default_expiry_days,
  redemption_enabled, applicable_scope
)
select true, 1000, 10, 100, 500, 299, true, false, 90, true, 'all'
where not exists (select 1 from public.wallet_settings);

-- 4. EXTEND orders TABLE FOR COIN & PROMO TRACKING
alter table public.orders add column if not exists coins_used numeric default 0 check (coins_used >= 0);
alter table public.orders add column if not exists coin_discount numeric default 0 check (coin_discount >= 0);
alter table public.orders add column if not exists promo_code text null;
alter table public.orders add column if not exists promo_discount numeric default 0 check (promo_discount >= 0);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

alter table public.wallet_accounts enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.wallet_settings enable row level security;

-- Customers: View own wallet account
drop policy if exists "Users can view own wallet account" on public.wallet_accounts;
create policy "Users can view own wallet account" on public.wallet_accounts
  for select using (
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

-- Customers: View own wallet transactions
drop policy if exists "Users can view own wallet transactions" on public.wallet_transactions;
create policy "Users can view own wallet transactions" on public.wallet_transactions
  for select using (
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

-- Customers: Read wallet settings
drop policy if exists "Customers can view wallet settings" on public.wallet_settings;
create policy "Customers can view wallet settings" on public.wallet_settings
  for select using (true);

-- Admins: Full management of wallet accounts
drop policy if exists "Admins have full access to wallet accounts" on public.wallet_accounts;
create policy "Admins have full access to wallet accounts" on public.wallet_accounts
  for all using (public.check_is_admin() = true);

-- Admins: Full management of wallet transactions
drop policy if exists "Admins have full access to wallet transactions" on public.wallet_transactions;
create policy "Admins have full access to wallet transactions" on public.wallet_transactions
  for all using (public.check_is_admin() = true);

-- Admins: Full management of wallet settings
drop policy if exists "Admins have full access to wallet settings" on public.wallet_settings;
create policy "Admins have full access to wallet settings" on public.wallet_settings
  for all using (public.check_is_admin() = true);

-- ============================================================
-- HELPER & ATOMIC TRANSACTION RPC PROCEDURES
-- ============================================================

-- 1. Get or Create Wallet Account
create or replace function public.get_or_create_wallet(p_patient_id uuid)
returns public.wallet_accounts as $$
declare
  v_wallet public.wallet_accounts%rowtype;
begin
  select * into v_wallet from public.wallet_accounts where patient_id = p_patient_id;
  if not found then
    insert into public.wallet_accounts (patient_id, coin_balance)
    values (p_patient_id, 0)
    returning * into v_wallet;
  end if;
  return v_wallet;
end;
$$ language plpgsql security definer set search_path = public;

-- Revoke anon/public, grant authenticated
revoke execute on function public.get_or_create_wallet(uuid) from public, anon;
grant execute on function public.get_or_create_wallet(uuid) to authenticated, service_role;

-- 2. Claim Signup Reward (IDEMPOTENT)
create or replace function public.claim_signup_reward_atomic(p_patient_id uuid)
returns jsonb as $$
declare
  v_wallet public.wallet_accounts%rowtype;
  v_settings public.wallet_settings%rowtype;
  v_coins numeric;
  v_before numeric;
  v_after numeric;
  v_tx_id uuid;
begin
  select * into v_settings from public.wallet_settings limit 1;
  if not found or not v_settings.signup_reward_enabled then
    return jsonb_build_object('success', false, 'message', 'Signup rewards are disabled.');
  end if;

  v_coins := coalesce(v_settings.signup_reward_coins, 1000);

  -- Ensure wallet exists with row lock
  select * into v_wallet from public.wallet_accounts where patient_id = p_patient_id for update;
  if not found then
    insert into public.wallet_accounts (patient_id, coin_balance)
    values (p_patient_id, 0)
    returning * into v_wallet;
  end if;

  -- Check if signup reward already exists for this patient
  if exists (select 1 from public.wallet_transactions where patient_id = p_patient_id and transaction_type = 'signup_reward') then
    return jsonb_build_object('success', true, 'already_claimed', true, 'balance', v_wallet.coin_balance);
  end if;

  v_before := v_wallet.coin_balance;
  v_after := v_before + v_coins;

  update public.wallet_accounts
  set coin_balance = v_after, updated_at = now()
  where id = v_wallet.id;

  insert into public.wallet_transactions (
    wallet_id, patient_id, transaction_type, coins,
    balance_before, balance_after, reference_type, reference_id, description
  ) values (
    v_wallet.id, p_patient_id, 'signup_reward', v_coins,
    v_before, v_after, 'signup', p_patient_id::text, '🎁 Welcome Reward — Health Express Signup'
  ) returning id into v_tx_id;

  return jsonb_build_object(
    'success', true,
    'already_claimed', false,
    'coins_credited', v_coins,
    'new_balance', v_after,
    'transaction_id', v_tx_id
  );
exception when unique_violation then
  select coin_balance into v_after from public.wallet_accounts where patient_id = p_patient_id;
  return jsonb_build_object('success', true, 'already_claimed', true, 'balance', v_after);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.claim_signup_reward_atomic(uuid) from public, anon;
grant execute on function public.claim_signup_reward_atomic(uuid) to authenticated, service_role;

-- 3. Deduct Wallet Coins Atomic (IDEMPOTENT ON CONFIRMED PAYMENT / ORDER)
create or replace function public.deduct_wallet_coins_atomic(
  p_patient_id uuid,
  p_coins_to_use numeric,
  p_order_id uuid,
  p_description text default null
) returns jsonb as $$
declare
  v_wallet public.wallet_accounts%rowtype;
  v_before numeric;
  v_after numeric;
  v_tx_id uuid;
  v_order_code text;
begin
  if p_coins_to_use <= 0 then
    return jsonb_build_object('success', true, 'deducted', 0, 'message', 'No coins requested.');
  end if;

  -- Idempotency check: If coins were already deducted for this order, return success immediately
  if exists (select 1 from public.wallet_transactions where reference_id = p_order_id::text and transaction_type = 'redeemed') then
    select coin_balance into v_after from public.wallet_accounts where patient_id = p_patient_id;
    return jsonb_build_object('success', true, 'already_deducted', true, 'balance', v_after);
  end if;

  select order_code into v_order_code from public.orders where id = p_order_id;

  -- Lock wallet row
  select * into v_wallet from public.wallet_accounts where patient_id = p_patient_id for update;
  if not found or v_wallet.coin_balance < p_coins_to_use then
    return jsonb_build_object('success', false, 'error', 'Insufficient Health Coins balance.');
  end if;

  v_before := v_wallet.coin_balance;
  v_after := v_before - p_coins_to_use;

  update public.wallet_accounts
  set coin_balance = v_after, updated_at = now()
  where id = v_wallet.id;

  insert into public.wallet_transactions (
    wallet_id, patient_id, transaction_type, coins,
    balance_before, balance_after, reference_type, reference_id, description
  ) values (
    v_wallet.id, p_patient_id, 'redeemed', -p_coins_to_use,
    v_before, v_after, 'order', p_order_id::text,
    coalesce(p_description, 'Redeemed on Order #' || coalesce(v_order_code, p_order_id::text))
  ) returning id into v_tx_id;

  -- Update order record
  update public.orders
  set coins_used = p_coins_to_use, updated_at = now()
  where id = p_order_id;

  return jsonb_build_object(
    'success', true,
    'already_deducted', false,
    'coins_deducted', p_coins_to_use,
    'new_balance', v_after,
    'transaction_id', v_tx_id
  );
exception when unique_violation then
  select coin_balance into v_after from public.wallet_accounts where patient_id = p_patient_id;
  return jsonb_build_object('success', true, 'already_deducted', true, 'balance', v_after);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.deduct_wallet_coins_atomic(uuid, numeric, uuid, text) from public, anon;
grant execute on function public.deduct_wallet_coins_atomic(uuid, numeric, uuid, text) to authenticated, service_role;

-- 4. Restore Wallet Coins Atomic (IDEMPOTENT ON ORDER REFUND / CANCELLATION)
create or replace function public.restore_wallet_coins_atomic(
  p_patient_id uuid,
  p_order_id uuid,
  p_description text default null
) returns jsonb as $$
declare
  v_wallet public.wallet_accounts%rowtype;
  v_redeemed_tx public.wallet_transactions%rowtype;
  v_coins_to_restore numeric;
  v_before numeric;
  v_after numeric;
  v_tx_id uuid;
begin
  -- Idempotency check: If refund was already issued for this order, return success
  if exists (select 1 from public.wallet_transactions where reference_id = p_order_id::text and transaction_type = 'refund') then
    select coin_balance into v_after from public.wallet_accounts where patient_id = p_patient_id;
    return jsonb_build_object('success', true, 'already_refunded', true, 'balance', v_after);
  end if;

  -- Find the redeemed transaction for this order
  select * into v_redeemed_tx
  from public.wallet_transactions
  where reference_id = p_order_id::text and transaction_type = 'redeemed';

  if not found then
    return jsonb_build_object('success', false, 'error', 'No coin redemption found for this order.');
  end if;

  v_coins_to_restore := abs(v_redeemed_tx.coins);
  if v_coins_to_restore <= 0 then
    return jsonb_build_object('success', true, 'restored', 0);
  end if;

  -- Lock wallet row
  select * into v_wallet from public.wallet_accounts where patient_id = p_patient_id for update;
  if not found then
    insert into public.wallet_accounts (patient_id, coin_balance)
    values (p_patient_id, 0)
    returning * into v_wallet;
  end if;

  v_before := v_wallet.coin_balance;
  v_after := v_before + v_coins_to_restore;

  update public.wallet_accounts
  set coin_balance = v_after, updated_at = now()
  where id = v_wallet.id;

  insert into public.wallet_transactions (
    wallet_id, patient_id, transaction_type, coins,
    balance_before, balance_after, reference_type, reference_id, description
  ) values (
    v_wallet.id, p_patient_id, 'refund', v_coins_to_restore,
    v_before, v_after, 'order', p_order_id::text,
    coalesce(p_description, '🪙 Restored Health Coins from Cancelled/Refunded Order')
  ) returning id into v_tx_id;

  return jsonb_build_object(
    'success', true,
    'already_refunded', false,
    'coins_restored', v_coins_to_restore,
    'new_balance', v_after,
    'transaction_id', v_tx_id
  );
exception when unique_violation then
  select coin_balance into v_after from public.wallet_accounts where patient_id = p_patient_id;
  return jsonb_build_object('success', true, 'already_refunded', true, 'balance', v_after);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.restore_wallet_coins_atomic(uuid, uuid, text) from public, anon;
grant execute on function public.restore_wallet_coins_atomic(uuid, uuid, text) to authenticated, service_role;

-- 5. Admin Manual Adjust Wallet Coins (IDEMPOTENT & AUDITED)
create or replace function public.admin_adjust_wallet_coins_atomic(
  p_patient_id uuid,
  p_coins numeric,
  p_type text,
  p_description text
) returns jsonb as $$
declare
  v_wallet public.wallet_accounts%rowtype;
  v_before numeric;
  v_after numeric;
  v_tx_id uuid;
begin
  if public.check_is_admin() is not true then
    raise exception 'Unauthorized: Admin privileges required to adjust wallet balance.';
  end if;

  if p_type not in ('admin_credit', 'admin_debit', 'adjustment') then
    raise exception 'Invalid adjustment type: %', p_type;
  end if;

  if not exists (select 1 from public.patients where id = p_patient_id) then
    raise exception 'Patient ID % does not exist.', p_patient_id;
  end if;

  -- Ensure wallet exists with row lock
  select * into v_wallet from public.wallet_accounts where patient_id = p_patient_id for update;
  if not found then
    insert into public.wallet_accounts (patient_id, coin_balance)
    values (p_patient_id, 0)
    returning * into v_wallet;
  end if;

  v_before := v_wallet.coin_balance;

  if p_type = 'admin_debit' then
    if v_before < abs(p_coins) then
      raise exception 'Cannot debit % coins. Current balance is only %.', abs(p_coins), v_before;
    end if;
    v_after := v_before - abs(p_coins);
  else
    v_after := v_before + abs(p_coins);
  end if;

  update public.wallet_accounts
  set coin_balance = v_after, updated_at = now()
  where id = v_wallet.id;

  insert into public.wallet_transactions (
    wallet_id, patient_id, transaction_type, coins,
    balance_before, balance_after, reference_type, reference_id, description
  ) values (
    v_wallet.id, p_patient_id, p_type,
    case when p_type = 'admin_debit' then -abs(p_coins) else abs(p_coins) end,
    v_before, v_after, 'admin', auth.uid()::text,
    coalesce(p_description, 'Admin Adjustment by Support')
  ) returning id into v_tx_id;

  return jsonb_build_object(
    'success', true,
    'new_balance', v_after,
    'transaction_id', v_tx_id
  );
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.admin_adjust_wallet_coins_atomic(uuid, numeric, text, text) from public, anon;
grant execute on function public.admin_adjust_wallet_coins_atomic(uuid, numeric, text, text) to authenticated;

-- ============================================================
-- UPDATE create_checkout_order TO RECEIVE COIN & PROMO FIELDS
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
  p_payment_method text default 'ONLINE',
  p_coins_used numeric default 0,
  p_coin_discount numeric default 0,
  p_promo_code text default null,
  p_promo_discount numeric default 0
) returns jsonb as $$
declare
  v_patient_id uuid;
  v_order_id uuid;
  v_order_code text;
  v_initial_order_status text;
  v_initial_payment_status text;
  v_mode text := upper(coalesce(p_payment_mode, 'DEMO'));
  v_method text := upper(coalesce(p_payment_method, 'ONLINE'));
begin
  -- 1. Find or Upsert Patient
  select id into v_patient_id
  from public.patients
  where phone_e164 = p_customer_phone;

  if v_patient_id is null then
    insert into public.patients (name, phone, phone_e164, email, city, user_id)
    values (
      trim(p_customer_name),
      p_customer_phone,
      p_customer_phone,
      case when p_customer_email is not null and trim(p_customer_email) <> '' then lower(trim(p_customer_email)) else null end,
      coalesce(p_city, 'Bengaluru'),
      p_user_id
    )
    returning id into v_patient_id;
  else
    update public.patients
    set name = trim(p_customer_name),
        email = coalesce(case when p_customer_email is not null and trim(p_customer_email) <> '' then lower(trim(p_customer_email)) else null end, email),
        city = coalesce(p_city, city),
        user_id = coalesce(p_user_id, user_id),
        updated_at = now()
    where id = v_patient_id;
  end if;

  -- 2. Generate unique order_code
  v_order_code := 'HX-' || floor(100000 + random() * 900000)::text;

  if v_method = 'COD' then
    v_initial_order_status := 'CONFIRMED';
    v_initial_payment_status := 'PENDING';
  else
    v_initial_order_status := 'PENDING';
    v_initial_payment_status := 'PENDING';
  end if;

  -- 3. Create Order
  insert into public.orders (
    order_code, patient_id, user_id, customer_name, customer_phone, customer_email,
    items, total_amount, currency, order_status, payment_status,
    coins_used, coin_discount, promo_code, promo_discount
  ) values (
    v_order_code, v_patient_id, p_user_id, trim(p_customer_name), p_customer_phone,
    case when p_customer_email is not null and trim(p_customer_email) <> '' then lower(trim(p_customer_email)) else null end,
    p_items, p_total_amount, 'INR', v_initial_order_status, v_initial_payment_status,
    coalesce(p_coins_used, 0), coalesce(p_coin_discount, 0), p_promo_code, coalesce(p_promo_discount, 0)
  ) returning id into v_order_id;

  -- 4. Create Initial Payment record
  insert into public.payments (
    order_id, patient_id, razorpay_order_id, amount, currency,
    payment_status, payment_method, payment_mode
  ) values (
    v_order_id, v_patient_id, coalesce(p_razorpay_order_id, 'pending_' || v_order_id::text),
    p_total_amount, 'INR', v_initial_payment_status, v_method, v_mode
  );

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_code', v_order_code,
    'patient_id', v_patient_id,
    'razorpay_order_id', coalesce(p_razorpay_order_id, 'pending_' || v_order_id::text),
    'payment_method', v_method,
    'payment_mode', v_mode
  );
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.create_checkout_order(text, text, text, text, jsonb, numeric, text, text, uuid, text, numeric, numeric, text, numeric) from public;
grant execute on function public.create_checkout_order(text, text, text, text, jsonb, numeric, text, text, uuid, text, numeric, numeric, text, numeric) to anon, authenticated;

-- ============================================================
-- UPDATE verify_and_confirm_order_payment TO TRIGGER ATOMIC COIN DEDUCTION
-- ============================================================
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

  -- IF COINS WERE APPLIED TO THIS ORDER, DEDUCT THEM ATOMICALLY UPON VERIFIED PAYMENT
  if v_existing_order.coins_used > 0 and v_existing_order.patient_id is not null then
    perform public.deduct_wallet_coins_atomic(
      v_existing_order.patient_id,
      v_existing_order.coins_used,
      v_existing_order.id,
      'Redeemed on Order #' || v_existing_order.order_code
    );
  end if;

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
