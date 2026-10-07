-- ============================================================
-- HEALTH EXPRESS — SUPABASE MIGRATION
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

-- 3. Create RPC function for Admin to mark COD payment as collected
create or replace function public.mark_cod_payment_collected(
  p_order_id uuid
) returns jsonb as $$
declare
  v_order public.orders%rowtype;
begin
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

revoke execute on function public.mark_cod_payment_collected(uuid) from public;
grant execute on function public.mark_cod_payment_collected(uuid) to authenticated, anon;
