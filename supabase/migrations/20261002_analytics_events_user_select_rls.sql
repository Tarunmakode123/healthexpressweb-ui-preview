-- ============================================================
-- HEALTH EXPRESS — DATABASE MIGRATION
-- Allow Authenticated Patients to Read Own Analytics & Activity Events
-- File: supabase/migrations/20261002_analytics_events_user_select_rls.sql
-- ============================================================

-- Ensure Row Level Security remains enabled
alter table public.analytics_events enable row level security;

-- Idempotent Policy Definition: Grant Authenticated Patients SELECT Access to Own Events
drop policy if exists "Users can view own analytics events" on public.analytics_events;

create policy "Users can view own analytics events"
on public.analytics_events
for select
to authenticated
using (
  user_id = auth.uid()
  or (
    patient_id is not null and patient_id in (
      select id
      from public.patients
      where user_id = auth.uid()
    )
  )
);
