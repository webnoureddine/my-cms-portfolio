-- ============================================================================
-- MIGRATION 4 — project purpose, phone number, and project reviews (stars + comments)
-- Safe to run multiple times.
--
-- HOW TO RUN: Supabase dashboard → SQL Editor → New query → paste → Run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SETTINGS — phone number (was hard-coded in Contact.js) + review moderation
-- ----------------------------------------------------------------------------
alter table public.settings add column if not exists phone text;
alter table public.settings add column if not exists reviews_auto_approve boolean default false;

-- Keep the number that used to be hard-coded on the site. Edit it from /admin.
update public.settings set phone = '0665818298'
where id = 1 and (phone is null or phone = '');

-- ----------------------------------------------------------------------------
-- 2. PROJECTS — who / what the project was built for
--    purpose:        client | education | personal | open_source | other
--    purpose_detail: client name, school/course, or a short note for "other"
--    project_year:   free text, e.g. "2025"
-- ----------------------------------------------------------------------------
alter table public.projects add column if not exists purpose        text default 'personal';
alter table public.projects add column if not exists purpose_detail text default '';
alter table public.projects add column if not exists project_year   text default '';

update public.projects set purpose = 'personal' where purpose is null;

do $$
begin
  alter table public.projects
    add constraint projects_purpose_check
    check (purpose in ('client', 'education', 'personal', 'open_source', 'other'));
exception when duplicate_object then null;
end $$;

-- ----------------------------------------------------------------------------
-- 3. PROJECT_REVIEWS — visitor star ratings + optional comment
-- ----------------------------------------------------------------------------
create table if not exists public.project_reviews (
  id          uuid primary key default gen_random_uuid(),
  project_id  text not null references public.projects(id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  rating      smallint not null check (rating between 1 and 5),
  comment     text check (comment is null or char_length(comment) <= 1000),
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists project_reviews_project_idx
  on public.project_reviews (project_id, created_at desc);

alter table public.project_reviews enable row level security;

-- Visitors can never approve their own review: for anyone who isn't the
-- logged-in admin, `approved` is forced to the value of
-- settings.reviews_auto_approve (off by default = moderation queue).
create or replace function public.project_reviews_set_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), 'anon') <> 'authenticated' then
    new.approved   := coalesce((select reviews_auto_approve from public.settings where id = 1), false);
    new.created_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists project_reviews_before_insert on public.project_reviews;
create trigger project_reviews_before_insert
  before insert on public.project_reviews
  for each row execute function public.project_reviews_set_approval();

-- Public: read approved reviews, submit new ones.
drop policy if exists "reviews_public_read" on public.project_reviews;
create policy "reviews_public_read" on public.project_reviews
  for select using (approved = true);

drop policy if exists "reviews_public_insert" on public.project_reviews;
create policy "reviews_public_insert" on public.project_reviews
  for insert with check (true);   -- column CHECKs + trigger above do the guarding

-- Admin: read everything (including pending), approve/hide, delete.
drop policy if exists "reviews_admin_read" on public.project_reviews;
create policy "reviews_admin_read" on public.project_reviews
  for select using (auth.role() = 'authenticated');

drop policy if exists "reviews_admin_update" on public.project_reviews;
create policy "reviews_admin_update" on public.project_reviews
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "reviews_admin_delete" on public.project_reviews;
create policy "reviews_admin_delete" on public.project_reviews
  for delete using (auth.role() = 'authenticated');

-- Live updates on the public site when a review is approved.
do $$
begin
  alter publication supabase_realtime add table public.project_reviews;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
