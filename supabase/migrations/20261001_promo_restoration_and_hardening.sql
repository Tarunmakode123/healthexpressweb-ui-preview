-- ============================================================
-- HEALTH EXPRESS — PROMO CODE RESTORATION & HARDENING MIGRATION
-- Adds percentage CHECK constraint & atomic promo usage restoration RPC
-- ============================================================

-- 1. P3 DATABASE HARDENING: Ensure percentage discount <= 100%
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_promo_codes_percentage_max'
  ) then
    alter table public.promo_codes 
      add constraint chk_promo_codes_percentage_max 
      check (discount_type != 'percentage' or discount_value <= 100);
  end if;
end $$;

-- 2. P2 PROMO USAGE RESTORATION RPC (IDEMPOTENT & AUDITED)
create or replace function public.restore_promo_usage_atomic(
  p_order_id uuid,
  p_patient_id uuid default null
) returns jsonb as $$
declare
  v_usage public.promo_code_usage%rowtype;
  v_promo public.promo_codes%rowtype;
  v_used_count integer;
begin
  -- 1. Check if usage record exists for this order
  select * into v_usage
  from public.promo_code_usage
  where order_id = p_order_id
  limit 1;

  if not found then
    return jsonb_build_object('success', true, 'restored', false, 'message', 'No promo code usage recorded for this order.');
  end if;

  -- 2. Prevent double restoration: If discount_applied is already 0, it was already restored
  if v_usage.discount_applied = 0 then
    return jsonb_build_object('success', true, 'already_restored', true, 'message', 'Promo usage already restored.');
  end if;

  -- 3. Lock promo_codes row FOR UPDATE
  select * into v_promo
  from public.promo_codes
  where id = v_usage.promo_code_id
  for update;

  if found then
    v_used_count := greatest(0, v_promo.used_count - 1);
    update public.promo_codes
    set used_count = v_used_count,
        updated_at = now()
    where id = v_promo.id;
  end if;

  -- 4. Mark usage record as reversed (discount_applied = 0) while keeping audit log
  update public.promo_code_usage
  set discount_applied = 0
  where id = v_usage.id;

  return jsonb_build_object(
    'success', true,
    'restored', true,
    'promo_id', v_usage.promo_code_id,
    'order_id', p_order_id,
    'new_used_count', coalesce(v_used_count, 0)
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Revoke execute from anon & public; grant strictly to authenticated and service_role
revoke execute on function public.restore_promo_usage_atomic(uuid, uuid) from public, anon;
grant execute on function public.restore_promo_usage_atomic(uuid, uuid) to authenticated, service_role;
