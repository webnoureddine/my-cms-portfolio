-- Migration 3: Arabic language support
-- Adds optional Arabic (_ar) columns alongside the existing English/French ones.
-- Safe to run multiple times (IF NOT EXISTS). If left empty, the site
-- automatically falls back to the English text, so nothing breaks if you
-- don't fill these in right away.

-- settings
alter table public.settings add column if not exists home_desc_ar   text;
alter table public.settings add column if not exists about_bio_ar  text;
alter table public.settings add column if not exists about_bio2_ar text;

-- projects
alter table public.projects add column if not exists title_ar             text;
alter table public.projects add column if not exists description_ar       text;
alter table public.projects add column if not exists long_description_ar  text;

-- skills
alter table public.skills add column if not exists title_ar text;
