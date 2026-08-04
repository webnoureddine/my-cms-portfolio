-- ============================================================================
-- MIGRATION — run this if you already ran schema.sql before this update.
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE everywhere).
--
-- HOW TO RUN: Supabase dashboard → SQL Editor → New query → paste → Run.
-- ============================================================================

-- 1. CV / Resume download — settings.cv_url stores the uploaded PDF's public URL.
alter table public.settings add column if not exists cv_url text;

-- 2. Site analytics — one row per page load, only admin can read it.
create table if not exists public.page_views (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  path        text
);

alter table public.page_views enable row level security;

drop policy if exists "page_views_public_insert" on public.page_views;
create policy "page_views_public_insert" on public.page_views for insert with check (true);

drop policy if exists "page_views_admin_read" on public.page_views;
create policy "page_views_admin_read" on public.page_views for select
  using (auth.role() = 'authenticated');

drop policy if exists "page_views_admin_delete" on public.page_views;
create policy "page_views_admin_delete" on public.page_views for delete
  using (auth.role() = 'authenticated');
