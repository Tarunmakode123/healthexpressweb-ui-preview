-- ============================================================
-- HEALTH EXPRESS — HEALTH COINS / WALLET REWARDS SYSTEM
-- Production-Hardened Database Migration with Security Checks
-- File: supabase/migrations/20260929_health_coins_wallet_system.sql
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
create unique index if not exists idx_wallet_signup_reward on public.wallet_transactions(patient_id) where (transaction_type = 'signup_reward');
create unique index if not exists idx_wallet_redeemed_order on public.wallet_transactions(reference_id) where (transaction_type = 'redeemed');
create unique index if not exists idx_wallet_refund_order on public.wallet_transactions(reference_id) where (transaction_type = 'refund');

-- 3. TABLE: public.wallet_settings (SINGLETON TABLE DESIGN)
create table if not exists public.wallet_settings (
  id integer primary key default 1 check (id = 1),
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

-- Seed initial single configuration row if not present (Singleton pattern)
insert into public.wallet_settings (
  id, signup_reward_enabled, signup_reward_coins, coins_per_rupee,
  minimum_coins_to_redeem, maximum_coins_per_order, minimum_order_amount,
  allow_stacking_with_promo, coin_expiry_enabled, default_expiry_days,
  redemption_enabled, applicable_scope
)
values (1, true, 1000, 10, 100, 500, 299, true, false, 90, true, 'all')
on conflict (id) do nothing;

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

drop policy if exists "Users can view own wallet account" on public.wallet_accounts;
create policy "Users can view own wallet account" on public.wallet_accounts
  for select using (
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

drop policy if exists "Users can view own wallet transactions" on public.wallet_transactions;
create policy "Users can view own wallet transactions" on public.wallet_transactions
  for select using (
    patient_id in (select id from public.patients where user_id = auth.uid())
  );

drop policy if exists "Customers can view wallet settings" on public.wallet_settings;
create policy "Customers can view wallet settings" on public.wallet_settings
  for select using (true);

drop policy if exists "Admins have full access to wallet accounts" on public.wallet_accounts;
create policy "Admins have full access to wallet accounts" on public.wallet_accounts
  for all using (public.check_is_admin() = true);

drop policy if exists "Admins have full access to wallet transactions" on public.wallet_transactions;
create policy "Admins have full access to wallet transactions" on public.wallet_transactions
  for all using (public.check_is_admin() = true);

drop policy if exists "Admins have full access to wallet settings" on public.wallet_settings;
create policy "Admins have full access to wallet settings" on public.wallet_settings
  for all using (public.check_is_admin() = true);

-- ============================================================
-- HELPER & ATOMIC TRANSACTION RPC PROCEDURES (SECURITY HARDENED)
-- ============================================================

-- 1. Get or Create Wallet Account (Patient Ownership Verified)
create or replace function public.get_or_create_wallet(p_patient_id uuid)
returns public.wallet_accounts as $$
declare
  v_wallet public.wallet_accounts%rowtype;
begin
  if auth.role() = 'authenticated' and (public.check_is_admin() is not true) then
    if not exists (
      select 1 from public.patients
      where id = p_patient_id and user_id = auth.uid()
    ) then
      raise exception 'Access denied: Patient record does not belong to authenticated user.';
    end if;
  end if;

  select * into v_wallet from public.wallet_accounts where patient_id = p_patient_id;
  if not found then
    insert into public.wallet_accounts (patient_id, coin_balance)
    values (p_patient_id, 0)
    returning * into v_wallet;
  end if;
  return v_wallet;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.get_or_create_wallet(uuid) from public, anon;
grant execute on function public.get_or_create_wallet(uuid) to authenticated, service_role;

-- 2. Claim Signup Reward (IDEMPOTENT & Patient Ownership Verified)
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
  if auth.role() = 'authenticated' and (public.check_is_admin() is not true) then
    if not exists (
      select 1 from public.patients
      where id = p_patient_id and user_id = auth.uid()
    ) then
      raise exception 'Access denied: Patient record does not belong to authenticated user.';
    end if;
  end if;

  select * into v_settings from public.wallet_settings limit 1;
  if not found or not v_settings.signup_reward_enabled then
    return jsonb_build_object('success', false, 'message', 'Signup rewards are disabled.');
  end if;

  v_coins := coalesce(v_settings.signup_reward_coins, 1000);

  select * into v_wallet from public.wallet_accounts where patient_id = p_patient_id for update;
  if not found then
    insert into public.wallet_accounts (patient_id, coin_balance)
    values (p_patient_id, 0)
    returning * into v_wallet;
  end if;

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

-- 3. Deduct Wallet Coins Atomic (INTERNAL SERVICE-ROLE ONLY RPC)
create or replace function public.deduct_wallet_coins_atomic(
  p_patient_id uuid,
  p_coins_to_use numeric,
  p_order_id uuid,
  p_description text default null
) returns jsonb as $$
declare
  v_wallet public.wallet_accounts%rowtype;
  v_order public.orders%rowtype;
  v_authoritative_coins numeric;
  v_before numeric;
  v_after numeric;
  v_tx_id uuid;
begin
  -- 1. Patient ownership validation for authenticated users
  if auth.role() = 'authenticated' and (public.check_is_admin() is not true) then
    if not exists (
      select 1 from public.patients
      where id = p_patient_id and user_id = auth.uid()
    ) then
      raise exception 'Access denied: Patient record does not belong to authenticated user.';
    end if;
  end if;

  -- 2. Read authoritative order record and validate order ownership
  select * into v_order from public.orders where id = p_order_id;
  if not found or v_order.patient_id <> p_patient_id then
    raise exception 'Access denied: Order % does not exist or does not belong to patient %.', p_order_id, p_patient_id;
  end if;

  v_authoritative_coins := coalesce(v_order.coins_used, 0);

  if v_authoritative_coins <= 0 then
    return jsonb_build_object('success', true, 'deducted', 0, 'message', 'No coins applied to this order.');
  end if;

  -- 3. Reject if client-supplied p_coins_to_use differs from order stored coins_used
  if p_coins_to_use is not null and p_coins_to_use > 0 and p_coins_to_use <> v_authoritative_coins then
    raise exception 'Deduction mismatch: Requested coins (%) does not match order stored coins_used (%).', p_coins_to_use, v_authoritative_coins;
  end if;

  -- 4. Idempotency check: If coins were already deducted for this order, return success
  if exists (select 1 from public.wallet_transactions where reference_id = p_order_id::text and transaction_type = 'redeemed') then
    select coin_balance into v_after from public.wallet_accounts where patient_id = p_patient_id;
    return jsonb_build_object('success', true, 'already_deducted', true, 'balance', v_after);
  end if;

  -- 5. Lock wallet row & check balance against authoritative coins_used
  select * into v_wallet from public.wallet_accounts where patient_id = p_patient_id for update;
  if not found or v_wallet.coin_balance < v_authoritative_coins then
    return jsonb_build_object('success', false, 'error', 'Insufficient Health Coins balance.');
  end if;

  v_before := v_wallet.coin_balance;
  v_after := v_before - v_authoritative_coins;

  update public.wallet_accounts
  set coin_balance = v_after, updated_at = now()
  where id = v_wallet.id;

  insert into public.wallet_transactions (
    wallet_id, patient_id, transaction_type, coins,
    balance_before, balance_after, reference_type, reference_id, description
  ) values (
    v_wallet.id, p_patient_id, 'redeemed', -v_authoritative_coins,
    v_before, v_after, 'order', p_order_id::text,
    coalesce(p_description, 'Redeemed on Order #' || coalesce(v_order.order_code, p_order_id::text))
  ) returning id into v_tx_id;

  return jsonb_build_object(
    'success', true,
    'already_deducted', false,
    'coins_deducted', v_authoritative_coins,
    'new_balance', v_after,
    'transaction_id', v_tx_id
  );
exception when unique_violation then
  select coin_balance into v_after from public.wallet_accounts where patient_id = p_patient_id;
  return jsonb_build_object('success', true, 'already_deducted', true, 'balance', v_after);
end;
$$ language plpgsql security definer set search_path = public;

-- Revoke execution from public, anon, and authenticated; grant strictly to service_role
revoke execute on function public.deduct_wallet_coins_atomic(uuid, numeric, uuid, text) from public, anon, authenticated;
grant execute on function public.deduct_wallet_coins_atomic(uuid, numeric, uuid, text) to service_role;

-- 4. Restore Wallet Coins Atomic (STRICT AUTHORIZATION SEQUENCE & IDEMPOTENT)
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
  -- STEP 1 & 2: Patient ownership validation for authenticated users
  if auth.role() = 'authenticated' and (public.check_is_admin() is not true) then
    if not exists (
      select 1 from public.patients
      where id = p_patient_id and user_id = auth.uid()
    ) then
      raise exception 'Access denied: Patient record does not belong to authenticated user.';
    end if;
  end if;

  -- STEP 3 & 4: Validate order belongs to patient and is in cancelled/failed/refunded state
  if not exists (
    select 1 from public.orders
    where id = p_order_id
      and patient_id = p_patient_id
      and (order_status in ('CANCELLED', 'FAILED') or payment_status in ('FAILED', 'REFUNDED', 'CANCELLED'))
  ) then
    raise exception 'Access denied or invalid state: Order % does not belong to patient % or is not cancelled/failed.', p_order_id, p_patient_id;
  end if;

  -- STEP 5: Idempotency check ONLY AFTER authorization & ownership validation
  if exists (select 1 from public.wallet_transactions where reference_id = p_order_id::text and transaction_type = 'refund') then
    select coin_balance into v_after from public.wallet_accounts where patient_id = p_patient_id;
    return jsonb_build_object('success', true, 'already_refunded', true, 'balance', v_after);
  end if;

  -- STEP 6: Find redeemed transaction for this order
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
-- UPDATE create_checkout_order WITH SERVER-SIDE COIN & PATIENT OWNERSHIP VALIDATION
-- ============================================================

drop function if exists public.create_checkout_order(text, text, text, text, jsonb, numeric, text, text, uuid, text);

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
  v_existing_patient_id uuid;
  v_existing_patient_user_id uuid;
  v_order_id uuid;
  v_order_code text;
  v_initial_order_status text;
  v_initial_payment_status text;
  v_actual_user_id uuid;
  v_mode text := upper(coalesce(p_payment_mode, 'DEMO'));
  v_method text := upper(coalesce(p_payment_method, 'ONLINE'));
  v_settings public.wallet_settings%rowtype;
  v_expected_discount numeric;
  v_patient_balance numeric;
  v_coin_result jsonb;
  v_gross_amount numeric;
begin
  -- STAGE 1: Determine actual user_id based on caller role
  if auth.role() = 'service_role' or public.check_is_admin() is true then
    v_actual_user_id := p_user_id;
  elsif auth.role() = 'authenticated' then
    v_actual_user_id := auth.uid(); -- Authenticated caller MUST use auth.uid()
  else
    v_actual_user_id := null; -- Anonymous caller MUST be NULL
  end if;

  -- STAGE 2: Find or Upsert Patient with Strict Ownership Protection
  select id, user_id into v_existing_patient_id, v_existing_patient_user_id
  from public.patients
  where phone_e164 = p_customer_phone;

  if v_existing_patient_id is null then
    insert into public.patients (full_name, phone_e164, email, city, user_id)
    values (
      trim(p_customer_name),
      p_customer_phone,
      case when p_customer_email is not null and trim(p_customer_email) <> '' then lower(trim(p_customer_email)) else null end,
      coalesce(p_city, 'Bengaluru'),
      v_actual_user_id
    )
    returning id into v_patient_id;
  else
    -- STRICT PATIENT OWNERSHIP VALIDATION
    if auth.role() = 'authenticated' and (public.check_is_admin() is not true) then
      if v_existing_patient_user_id is not null and v_existing_patient_user_id <> auth.uid() then
        raise exception 'Access denied: Patient record associated with % belongs to another user account.', p_customer_phone;
      end if;
    end if;

    v_patient_id := v_existing_patient_id;
    update public.patients
    set full_name = trim(p_customer_name),
        email = coalesce(case when p_customer_email is not null and trim(p_customer_email) <> '' then lower(trim(p_customer_email)) else null end, email),
        city = coalesce(p_city, city),
        user_id = case
                    when v_existing_patient_user_id is not null then v_existing_patient_user_id -- Preserve existing authenticated ownership
                    when v_actual_user_id is not null then v_actual_user_id -- Associate unowned patient to current authenticated user
                    else v_existing_patient_user_id
                  end,
        updated_at = now()
    where id = v_patient_id;
  end if;

  -- STAGE 3: SERVER-SIDE FINANCIAL VALIDATION FOR HEALTH COINS
  v_gross_amount := coalesce(p_total_amount, 0) + coalesce(p_coin_discount, 0) + coalesce(p_promo_discount, 0);

  if coalesce(p_total_amount, 0) < 0 then
    raise exception 'Order total amount cannot be negative.';
  end if;

  if coalesce(p_coins_used, 0) < 0 or coalesce(p_coin_discount, 0) < 0 or coalesce(p_promo_discount, 0) < 0 then
    raise exception 'Invalid financial values: coins_used, coin_discount, and promo_discount cannot be negative.';
  end if;

  if coalesce(p_coins_used, 0) = 0 then
    if coalesce(p_coin_discount, 0) <> 0 then
      raise exception 'Invalid coin values: coin_discount must be 0 when coins_used is 0.';
    end if;
  else
    select * into v_settings from public.wallet_settings limit 1;
    if not found or not v_settings.redemption_enabled then
      raise exception 'Health Coins redemption is currently disabled.';
    end if;

    if v_gross_amount < v_settings.minimum_order_amount then
      raise exception 'Minimum order amount to redeem coins is ₹%.', v_settings.minimum_order_amount;
    end if;

    if p_coins_used < v_settings.minimum_coins_to_redeem then
      raise exception 'Minimum coins required to redeem is %.', v_settings.minimum_coins_to_redeem;
    end if;

    if p_coins_used > v_settings.maximum_coins_per_order then
      raise exception 'Maximum coins allowed per order is %.', v_settings.maximum_coins_per_order;
    end if;

    v_expected_discount := round(p_coins_used / v_settings.coins_per_rupee, 2);
    if abs(coalesce(p_coin_discount, 0) - v_expected_discount) > 0.01 then
      raise exception 'Invalid coin discount calculation: % coins equals ₹%, but ₹% was provided.', p_coins_used, v_expected_discount, p_coin_discount;
    end if;

    if p_coin_discount > (v_gross_amount - coalesce(p_promo_discount, 0)) then
      raise exception 'Coin discount cannot exceed order subtotal after promo discount.';
    end if;

    select coin_balance into v_patient_balance
    from public.wallet_accounts
    where patient_id = v_patient_id;

    if coalesce(v_patient_balance, 0) < p_coins_used then
      raise exception 'Insufficient Health Coins: Patient has % coins, but % coins requested.', coalesce(v_patient_balance, 0), p_coins_used;
    end if;
  end if;

  -- STAGE 4: Generate unique order code & initial statuses
  v_order_code := 'HX-' || floor(100000 + random() * 900000)::text;

  if v_method = 'COD' then
    v_initial_order_status := 'CONFIRMED';
    v_initial_payment_status := 'PENDING';
  else
    v_initial_order_status := 'PENDING';
    v_initial_payment_status := 'PENDING';
  end if;

  -- STAGE 5: Create Order Record
  insert into public.orders (
    order_code, patient_id, user_id, customer_name, customer_phone, customer_email,
    items, total_amount, currency, order_status, payment_status,
    coins_used, coin_discount, promo_code, promo_discount
  ) values (
    v_order_code, v_patient_id, v_actual_user_id, trim(p_customer_name), p_customer_phone,
    case when p_customer_email is not null and trim(p_customer_email) <> '' then lower(trim(p_customer_email)) else null end,
    p_items, p_total_amount, 'INR', v_initial_order_status, v_initial_payment_status,
    coalesce(p_coins_used, 0), coalesce(p_coin_discount, 0), p_promo_code, coalesce(p_promo_discount, 0)
  ) returning id into v_order_id;

  -- STAGE 6: Create Initial Payment Record
  insert into public.payments (
    order_id, patient_id, razorpay_order_id, amount, currency,
    payment_status, payment_method, payment_mode
  ) values (
    v_order_id, v_patient_id, coalesce(p_razorpay_order_id, 'pending_' || v_order_id::text),
    p_total_amount, 'INR', v_initial_payment_status, v_method, v_mode
  );

  -- STAGE 7: ATOMIC COIN DEDUCTION FOR INSTANT COD CONFIRMED ORDERS
  if v_method = 'COD' and coalesce(p_coins_used, 0) > 0 then
    v_coin_result := public.deduct_wallet_coins_atomic(
      v_patient_id,
      p_coins_used,
      v_order_id,
      'Redeemed on COD Order #' || v_order_code
    );
    if (v_coin_result->>'success')::boolean is not true then
      raise exception 'COD Order creation failed: Wallet coin deduction error - %', coalesce(v_coin_result->>'error', 'Insufficient Health Coins balance.');
    end if;
  end if;

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
-- UPDATE verify_and_confirm_order_payment WITH ATOMIC COIN DEDUCTION RESULT CHECK
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
  v_coin_result jsonb;
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

  -- ATOMIC COIN DEDUCTION RESULT INSPECTION
  if coalesce(v_existing_order.coins_used, 0) > 0 and v_existing_order.patient_id is not null then
    v_coin_result := public.deduct_wallet_coins_atomic(
      v_existing_order.patient_id,
      v_existing_order.coins_used,
      v_existing_order.id,
      'Redeemed on Order #' || v_existing_order.order_code
    );

    if (v_coin_result->>'success')::boolean is not true then
      raise exception 'Payment confirmation failed: Wallet coin deduction error - %', coalesce(v_coin_result->>'error', 'Insufficient Health Coins balance.');
    end if;
  end if;

  -- CONFIRM ORDER AND PAYMENT ATOMICALLY
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

-- Revoke execution from public, anon, and ordinary authenticated users.
-- Grant strictly to service_role so payment status can only be confirmed by trusted server endpoints.
revoke execute on function public.verify_and_confirm_order_payment(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.verify_and_confirm_order_payment(uuid, text, text, text, text, text) to service_role;
