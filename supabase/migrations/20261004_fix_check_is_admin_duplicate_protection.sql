-- ============================================================
-- HEALTH EXPRESS — SUPABASE SQL MIGRATION
-- HARDEN check_is_admin() WITH DETERMINISTIC EXISTS LOOKUP
-- ============================================================

-- 1. Ensure is_admin column exists on public.patients
alter table public.patients add column if not exists is_admin boolean default false;

-- 2. HARDEN check_is_admin() SECURITY DEFINER RPC WITH DETERMINISTIC EXISTS CHECK
create or replace function public.check_is_admin()
returns boolean as $$
declare
  v_is_admin boolean := false;
  v_user_email text;
begin
  if auth.uid() is null then
    return false;
  end if;

  -- A. Check if ANY patient record linked to auth.uid() has is_admin = true
  select exists (
    select 1
    from public.patients
    where user_id = auth.uid()
      and is_admin = true
  ) into v_is_admin;

  if v_is_admin is true then
    return true;
  end if;

  -- B. Check email from auth.users for primary admin email fallback
  select email into v_user_email
  from auth.users
  where id = auth.uid();

  if lower(coalesce(v_user_email, '')) = 'admin@healthexpress.in' then
    -- Auto-link patient record to auth.uid() and set is_admin = true
    update public.patients
    set user_id = auth.uid(),
        is_admin = true,
        updated_at = now()
    where lower(email) = 'admin@healthexpress.in' or user_id = auth.uid();

    if not found then
      insert into public.patients (user_id, full_name, email, phone_e164, is_admin, is_verified, city)
      values (auth.uid(), 'Health Express Admin', 'admin@healthexpress.in', '+910000000000', true, true, 'Bengaluru')
      on conflict do nothing;
    end if;

    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.check_is_admin() from public;
grant execute on function public.check_is_admin() to authenticated, anon;

-- 3. Ensure sync_admin_user() RPC function delegates to check_is_admin()
create or replace function public.sync_admin_user()
returns boolean as $$
begin
  return public.check_is_admin();
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.sync_admin_user() from public;
grant execute on function public.sync_admin_user() to authenticated, anon;
