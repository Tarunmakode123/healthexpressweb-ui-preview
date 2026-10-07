-- ============================================================
-- HEALTH EXPRESS — SUPABASE MIGRATION
-- CRITICAL SECURITY HARDENING FOR ADMIN RPCs & RLS POLICIES
-- ============================================================

-- 1. HARDEN mark_cod_payment_collected RPC: ENFORCE SERVER-SIDE ADMIN AUTHORIZATION
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

-- 2. HARDEN RLS UPDATE POLICIES FOR ORDERS & PAYMENTS (RESTRICT TO ADMIN ONLY)
drop policy if exists "Allow update for order verification" on public.orders;
create policy "Only admin can update orders" on public.orders
  for update using (
    public.check_is_admin() = true
  );

drop policy if exists "Allow update for payments" on public.payments;
create policy "Only admin can update payments" on public.payments
  for update using (
    public.check_is_admin() = true
  );

-- 3. HARDEN RLS UPDATE POLICIES FOR ENQUIRIES (RESTRICT TO ADMIN ONLY)
drop policy if exists "Only admin can update enquiries" on public.enquiries;
create policy "Only admin can update enquiries" on public.enquiries
  for update using (
    public.check_is_admin() = true
  );
