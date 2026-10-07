-- ============================================================
-- HEALTH EXPRESS — PROMO CODE & COUPON MANAGEMENT SYSTEM
-- Production-Hardened Database Migration with Scope Eligibility
-- ============================================================

-- 1. TABLE: public.promo_codes
create table if not exists public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_type text not null check (discount_type in ('flat', 'percentage')),
  discount_value numeric not null check (discount_value > 0),
  min_order_amount numeric default 0 check (min_order_amount >= 0),
  max_discount numeric null check (max_discount is null or max_discount > 0),
  applicable_scope text default 'all' not null check (applicable_scope in ('all', 'categories', 'items')),
  applicable_categories jsonb default '[]'::jsonb not null,
  applicable_items jsonb default '[]'::jsonb not null,
  valid_from timestamptz default now() not null,
  valid_until timestamptz null,
  usage_limit integer null check (usage_limit is null or usage_limit > 0),
  used_count integer default 0 check (used_count >= 0),
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Ensure columns exist if table was created earlier
alter table public.promo_codes add column if not exists applicable_scope text default 'all' not null check (applicable_scope in ('all', 'categories', 'items'));
alter table public.promo_codes add column if not exists applicable_categories jsonb default '[]'::jsonb not null;
alter table public.promo_codes add column if not exists applicable_items jsonb default '[]'::jsonb not null;

-- Index for code lookup and active status
create index if not exists idx_promo_codes_code on public.promo_codes(code);
create index if not exists idx_promo_codes_active on public.promo_codes(is_active, valid_from, valid_until);

-- 2. TABLE: public.promo_code_usage
create table if not exists public.promo_code_usage (
  id uuid default gen_random_uuid() primary key,
  promo_code_id uuid not null references public.promo_codes(id) on delete cascade,
  order_id uuid null references public.orders(id) on delete set null,
  patient_id uuid null references public.patients(id) on delete set null,
  discount_applied numeric not null check (discount_applied >= 0),
  created_at timestamptz default now() not null
);

-- Index for usage tracking
create index if not exists idx_promo_usage_promo_id on public.promo_code_usage(promo_code_id);
create index if not exists idx_promo_usage_order_id on public.promo_code_usage(order_id);
create index if not exists idx_promo_usage_patient_id on public.promo_code_usage(patient_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

alter table public.promo_codes enable row level security;
alter table public.promo_code_usage enable row level security;

-- Public / Anonymous Customers: Select active promo codes that are within validity dates
drop policy if exists "Customers can view active promo codes" on public.promo_codes;
create policy "Customers can view active promo codes" on public.promo_codes
  for select using (
    is_active = true and
    valid_from <= now() and
    (valid_until is null or valid_until >= now())
  );

-- Admins: Full management access to promo_codes using existing check_is_admin() RPC
drop policy if exists "Admins have full access to promo codes" on public.promo_codes;
create policy "Admins have full access to promo codes" on public.promo_codes
  for all using (
    public.check_is_admin() = true
  );

-- Admins: Full view access to promo_code_usage audit log
drop policy if exists "Admins can view promo code usage" on public.promo_code_usage;
create policy "Admins can view promo code usage" on public.promo_code_usage
  for select using (
    public.check_is_admin() = true
  );

-- ============================================================
-- ATOMIC PROMO CODE USAGE INCREMENT RPC FUNCTION
-- ============================================================

create or replace function public.record_promo_code_usage_atomic(
  p_code_id uuid,
  p_order_id uuid default null,
  p_patient_id uuid default null,
  p_discount_applied numeric default 0
) returns boolean as $$
declare
  v_usage_limit integer;
  v_used_count integer;
  v_is_active boolean;
  v_valid_from timestamptz;
  v_valid_until timestamptz;
begin
  -- 1. Lock and inspect target promo_code row
  select usage_limit, used_count, is_active, valid_from, valid_until
  into v_usage_limit, v_used_count, v_is_active, v_valid_from, v_valid_until
  from public.promo_codes
  where id = p_code_id
  for update;

  if not found then
    return false;
  end if;

  if not v_is_active then
    return false;
  end if;

  if v_valid_from is not null and v_valid_from > now() then
    return false;
  end if;

  if v_valid_until is not null and v_valid_until < now() then
    return false;
  end if;

  if v_usage_limit is not null and v_used_count >= v_usage_limit then
    return false;
  end if;

  -- 2. Increment used_count safely
  update public.promo_codes
  set used_count = used_count + 1,
      updated_at = now()
  where id = p_code_id;

  -- 3. Insert usage audit record
  insert into public.promo_code_usage (promo_code_id, order_id, patient_id, discount_applied)
  values (p_code_id, p_order_id, p_patient_id, p_discount_applied);

  return true;
end;
$$ language plpgsql security definer set search_path = public;

-- Revoke execute from public & anon; grant strictly to authenticated and service_role
revoke execute on function public.record_promo_code_usage_atomic(uuid, uuid, uuid, numeric) from public, anon;
grant execute on function public.record_promo_code_usage_atomic(uuid, uuid, uuid, numeric) to authenticated, service_role;
