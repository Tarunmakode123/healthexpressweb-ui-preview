-- ============================================================
-- HEALTH EXPRESS — SUPABASE MIGRATION
-- ENABLE REALTIME PUBLICATION FOR ORDERS, PRESCRIPTIONS, & ENQUIRIES
-- ============================================================

-- Safely add public.orders to supabase_realtime publication if not already a member
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;

-- Safely add public.prescriptions to supabase_realtime publication if not already a member
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'prescriptions'
  ) then
    alter publication supabase_realtime add table public.prescriptions;
  end if;
end $$;

-- Safely add public.enquiries to supabase_realtime publication if not already a member
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'enquiries'
  ) then
    alter publication supabase_realtime add table public.enquiries;
  end if;
end $$;
