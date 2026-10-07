-- ============================================================
-- HEALTH EXPRESS — SUPABASE MIGRATION
-- FIX CHECKOUT ORDER PATIENTS COLUMN ("full_name" vs "name")
-- ============================================================

drop function if exists public.create_checkout_order(text, text, text, text, jsonb, numeric, text, text, uuid, text, numeric, numeric, text, numeric);

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
