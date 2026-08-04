-- ============================================================================
-- Portfolio database schema for Supabase (Postgres)
-- ============================================================================
-- HOW TO RUN THIS:
-- 1. Go to https://supabase.com → create a free project.
-- 2. Open the project → "SQL Editor" (left sidebar) → "New query".
-- 3. Paste this ENTIRE file and click "Run".
-- 4. Then follow the storage bucket + auth steps at the bottom of README.md.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. SETTINGS  — a single row (id = 1) holding all "global" portfolio content:
--    name, location, contact links, about text, tech stack, stats, capabilities.
-- ----------------------------------------------------------------------------
create table if not exists public.settings (
  id              int primary key default 1,
  display_name    text default 'Your Name',
  location        text default '',
  email           text default '',
  linkedin        text default '',
  github          text default '',
  available       boolean default true,
  years_exp       text default '',
  project_count   text default '',
  photo_url       text,
  cv_url          text,
  home_desc_en    text default '',
  home_desc_fr    text default '',
  about_bio_en    text default '',
  about_bio_fr    text default '',
  about_bio2_en   text default '',
  about_bio2_fr   text default '',
  tech_stack      jsonb default '[]'::jsonb,
  stats           jsonb default '[]'::jsonb,
  capabilities    jsonb default '[]'::jsonb,
  updated_at      timestamptz default now(),
  constraint settings_single_row check (id = 1)
);

-- ----------------------------------------------------------------------------
-- 2. PROJECTS
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id                    text primary key default ('p_' || substr(gen_random_uuid()::text, 1, 8)),
  sort_order            int default 99,
  index_label           text default '',
  category              text default 'web',
  title                 text not null,
  title_fr              text default '',
  description           text default '',
  description_fr        text default '',
  long_description      text default '',
  long_description_fr   text default '',
  technologies          jsonb default '[]'::jsonb,
  github                text,
  live_url              text,
  video_url             text,
  thumbnail             text,
  images                jsonb default '[]'::jsonb,
  created_at            timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 3. SKILLS  — each row is a category (e.g. "Frontend") OR the special
--    "Tools" row (is_tools = true, skills have no numeric level).
-- ----------------------------------------------------------------------------
create table if not exists public.skills (
  id          text primary key default ('s_' || substr(gen_random_uuid()::text, 1, 8)),
  sort_order  int default 99,
  num         text default '',
  title_en    text not null,
  title_fr    text default '',
  is_tools    boolean default false,
  skills      jsonb default '[]'::jsonb  -- [{ "name": "React.js", "level": 95 }]  (level omitted for tools)
);

-- ----------------------------------------------------------------------------
-- 4. MESSAGES  — contact form submissions land here so you can read them
--    from the admin panel instead of needing an email service.
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 5. PAGE_VIEWS — one row per page load on the public site, used to power the
--    "visits" stats on the admin Dashboard tab.
-- ----------------------------------------------------------------------------
create table if not exists public.page_views (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  path        text
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Public visitors (the "anon" key used by the live site) can only READ
-- settings/projects/skills and INSERT into messages (submit the contact form).
-- Only a logged-in admin (Supabase Auth user) can write/edit/delete anything.
-- ============================================================================

alter table public.settings enable row level security;
alter table public.projects enable row level security;
alter table public.skills   enable row level security;
alter table public.messages enable row level security;
alter table public.page_views enable row level security;

-- SETTINGS: public read, admin write
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings for select using (true);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PROJECTS: public read, admin write
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects for select using (true);

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- SKILLS: public read, admin write
drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read" on public.skills for select using (true);

drop policy if exists "skills_admin_write" on public.skills;
create policy "skills_admin_write" on public.skills for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- MESSAGES: anyone can submit (insert), only admin can read/update/delete
drop policy if exists "messages_public_insert" on public.messages;
create policy "messages_public_insert" on public.messages for insert with check (true);

drop policy if exists "messages_admin_read" on public.messages;
create policy "messages_admin_read" on public.messages for select
  using (auth.role() = 'authenticated');

drop policy if exists "messages_admin_write" on public.messages;
create policy "messages_admin_write" on public.messages for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "messages_admin_delete" on public.messages;
create policy "messages_admin_delete" on public.messages for delete
  using (auth.role() = 'authenticated');

-- PAGE_VIEWS: anyone can insert (log a visit), only admin can read/delete
drop policy if exists "page_views_public_insert" on public.page_views;
create policy "page_views_public_insert" on public.page_views for insert with check (true);

drop policy if exists "page_views_admin_read" on public.page_views;
create policy "page_views_admin_read" on public.page_views for select
  using (auth.role() = 'authenticated');

drop policy if exists "page_views_admin_delete" on public.page_views;
create policy "page_views_admin_delete" on public.page_views for delete
  using (auth.role() = 'authenticated');

-- ============================================================================
-- SEED DATA — pre-fills the tables with your existing portfolio content so
-- the site isn't empty on first load. Edit everything afterwards from /admin.
-- ============================================================================

insert into public.settings (
  id, display_name, location, email, linkedin, github, available,
  years_exp, project_count, home_desc_en, home_desc_fr,
  about_bio_en, about_bio_fr, about_bio2_en, about_bio2_fr,
  tech_stack, stats, capabilities
) values (
  1,
  'IbraDev',
  'Algiers, Algeria',
  'contact@ibradev.com',
  'https://linkedin.com/in/your-profile',
  'https://github.com/yourusername',
  true,
  '4+',
  '10+',
  'Crafting modern web experiences with React & Django, building intelligent automations with Python and automations — from Algiers to anywhere.',
  'Création d''expériences web avec React & Django, automatisations intelligentes avec Python et automations — depuis Alger.',
  'I''m IbraDev, a full-stack developer based in Algiers, Algeria. I specialize in building modern, performant web applications with React and Tailwind, while creating robust backends with Django and Python.',
  'Je suis IbraDev, développeur full-stack basé à Alger. Je me spécialise dans les applications web modernes et performantes avec React et Tailwind, et les backends robustes avec Django et Python.',
  'My passion extends into automation — from AI-powered Python scripts to complex workflow orchestration with automations. I love turning repetitive tasks into efficient, automated systems that scale.',
  'Ma passion s''étend à l''automatisation — des scripts Python boostés à l''IA aux orchestrations complexes avec automations. J''adore transformer les tâches répétitives en systèmes automatisés efficaces.',
  '[
    {"label":"React.js","color":"#61DAFB","bg":"rgba(97, 218, 251, 0.1)"},
    {"label":"Django","color":"#092E20","bg":"rgba(9, 46, 32, 0.1)"},
    {"label":"Python","color":"#3776AB","bg":"rgba(55, 118, 171, 0.1)"},
    {"label":"PostgreSQL","color":"#336791","bg":"rgba(51, 103, 145, 0.1)"},
    {"label":"Automation","color":"#FF6B6B","bg":"rgba(255, 107, 107, 0.1)"},
    {"label":"Neo4j","color":"#4DBCC5","bg":"rgba(77, 188, 197, 0.1)"}
  ]'::jsonb,
  '[
    {"num":"4+","labelEn":"Years experience","labelFr":"Ans d''expérience"},
    {"num":"10+","labelEn":"Projects shipped","labelFr":"Projets livrés"},
    {"num":"2+","labelEn":"Automations live","labelFr":"Automatisations en prod"},
    {"num":"∞","labelEn":"Scalable solutions","labelFr":"Solutions évolutives"}
  ]'::jsonb,
  '[
    {"num":"01","titleEn":"Modern Web Development","titleFr":"Développement Web Moderne","descEn":"Fast, responsive applications built with React.js and Tailwind CSS — pixel-perfect, performant, and production-ready.","descFr":"Applications rapides et responsives avec React.js et Tailwind CSS — pixel-perfect, performantes et prêtes à déployer."},
    {"num":"02","titleEn":"Django Backends & APIs","titleFr":"Backends Django & APIs","descEn":"Secure, scalable REST APIs with Django REST Framework, JWT auth, Redis caching, and Celery async tasks.","descFr":"APIs REST sécurisées avec Django REST Framework, authentification JWT, cache Redis et tâches Celery."},
    {"num":"03","titleEn":"Advanced Database Design","titleFr":"Conception de BDD Avancée","descEn":"Relational (PostgreSQL/MySQL) and graph databases (Neo4j) for complex data models and rich relationships.","descFr":"Bases relationnelles (PostgreSQL/MySQL) et graphes (Neo4j) pour modèles de données complexes."},
    {"num":"04","titleEn":"AI & Automation Systems","titleFr":"IA & Systèmes d''Automatisation","descEn":"Python scripts, AI-powered tools, and automation workflow orchestration that turn repetitive tasks into intelligent pipelines.","descFr":"Scripts Python, outils IA et orchestration d''automatisations qui transforment les tâches répétitives en pipelines intelligents."}
  ]'::jsonb
)
on conflict (id) do nothing;

insert into public.projects (id, sort_order, index_label, category, title, title_fr, description, description_fr, long_description, long_description_fr, technologies, github, live_url, video_url, images)
values
(
  'p8', 1, '01', 'webapp',
  'AI Text-to-Image Generator', 'Générateur d''images IA (texte vers image)',
  'A clean single-page app that turns a text prompt into an AI-generated image — async job polling, download, and a dark, minimal UI.',
  'Une application monopage qui transforme un prompt texte en image générée par IA — suivi asynchrone du job, téléchargement et interface sombre minimaliste.',
  'A lightweight text-to-image generator built around the Picsart GenAI API. The user enters a prompt, the app kicks off an async inference job, then polls the job status every few seconds until the image is ready before rendering it in a card-style result view.',
  'Générateur texte-vers-image léger basé sur l''API Picsart GenAI. L''utilisateur saisit un prompt, l''application lance un job d''inférence asynchrone, puis interroge le statut du job avant d''afficher l''image.',
  '["JavaScript","HTML/CSS","Picsart GenAI API","Async Polling","Font Awesome"]'::jsonb,
  'https://github.com/yourusername/ai-text-to-image',
  'https://6a6537c740010eb10eaddbb4--splendorous-valkyrie-3de63e.netlify.app/',
  null,
  '[]'::jsonb
),
(
  'p3', 4, '04', 'automation',
  'Text2Video — Long & Shorts Pipeline', 'Pipeline Text2Video — Long & Shorts',
  'Paste a script → get a fully produced video: AI narration, auto-captions, background music, color overlays, and a vertical Shorts cut — all automated.',
  'Collez un script → obtenez une vidéo complète : narration IA, sous-titres automatiques, musique de fond, overlays colorés et un Shorts vertical — tout automatisé.',
  'A Python pipeline that turns a plain text script into a fully produced video with zero manual editing: AI voiceover, synchronized Arabic captions with RTL shaping, Ken Burns motion on AI-generated scenes, background music ducking, and an auto-generated 9:16 Shorts cut.',
  'Pipeline Python qui transforme un script texte en vidéo produite sans montage manuel : voix IA, sous-titres arabes synchronisés avec RTL, effets Ken Burns, musique de fond, et export Shorts 9:16 automatique.',
  '["Python","FFmpeg","ElevenLabs","OpenAI TTS","Flask","Pollinations AI","arabic_reshaper","python-bidi","Pillow"]'::jsonb,
  'https://github.com/yourusername/text2video',
  null,
  null,
  '[]'::jsonb
),
(
  'p7', 5, '05', 'automation',
  'Anime Motivation Video Engine', 'Moteur de Vidéos Motivation Anime',
  'A curated library of 500 anime fighting clips auto-assembled into motivational videos — smart clip scoring picks the most impactful moments for each script.',
  'Une bibliothèque de 500 clips anime de combat assemblés automatiquement en vidéos motivationnelles — un scoring intelligent choisit les moments les plus percutants.',
  'A fully automated motivational video pipeline built on a hand-curated library of 500 anime fighting/peak-moment clips. Each clip is scored across energy, intensity, pacing, and tone so the engine can match clips to each script segment, then renders TTS narration, color-graded overlays, ducked music, and Arabic RTL captions into both a 16:9 long-form video and a 9:16 Shorts cut.',
  'Pipeline de vidéos motivationnelles entièrement automatisé, basé sur 500 clips anime scorés selon plusieurs dimensions. Gère narration TTS, overlays de correction colorimétrique, musique avec duck automatique, sous-titres arabes RTL, et exporte une vidéo longue 16:9 et un Shorts 9:16.',
  '["Python","FFmpeg","ElevenLabs","OpenAI TTS","Pillow","arabic_reshaper","python-bidi","Flask","JSON"]'::jsonb,
  'https://github.com/yourusername/anime-motivation-engine',
  null,
  null,
  '[]'::jsonb
)
on conflict (id) do nothing;

insert into public.skills (id, sort_order, num, title_en, title_fr, is_tools, skills) values
('s1', 1, '01', 'Frontend',        'Frontend',             false, '[{"name":"React.js","level":95},{"name":"Tailwind CSS","level":92},{"name":"JavaScript ES6+","level":94},{"name":"HTML5 & CSS3","level":96}]'::jsonb),
('s2', 2, '02', 'Backend & APIs',  'Backend & APIs',       false, '[{"name":"Django","level":93},{"name":"Django REST Framework","level":90},{"name":"Python","level":95}]'::jsonb),
('s3', 3, '03', 'Databases',       'Bases de Données',     false, '[{"name":"PostgreSQL / MySQL","level":88},{"name":"Neo4j (Graph DB)","level":85}]'::jsonb),
('s4', 4, '04', 'Automation & AI', 'Automatisation & IA',  false, '[{"name":"Python Automation","level":96},{"name":"AI-Powered Scripts","level":89},{"name":"Web Scraping","level":91}]'::jsonb),
('s5', 5, '05', 'Workflows',       'Workflows',            false, '[{"name":"Automations","level":94},{"name":"Integration Pipelines","level":90}]'::jsonb),
('s6', 6, '06', 'Tools',           'Outils',               true,  '[{"name":"Git & GitHub"},{"name":"VS Code"},{"name":"Postman"},{"name":"Docker"},{"name":"Vercel"},{"name":"Linux"},{"name":"Figma"}]'::jsonb)
on conflict (id) do nothing;

-- ============================================================================
-- STORAGE BUCKET for images uploaded from the admin panel (project screenshots,
-- profile photo). Public read, admin-only write.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

drop policy if exists "portfolio_public_read" on storage.objects;
create policy "portfolio_public_read" on storage.objects for select
  using (bucket_id = 'portfolio');

drop policy if exists "portfolio_admin_insert" on storage.objects;
create policy "portfolio_admin_insert" on storage.objects for insert
  with check (bucket_id = 'portfolio' and auth.role() = 'authenticated');

drop policy if exists "portfolio_admin_update" on storage.objects;
create policy "portfolio_admin_update" on storage.objects for update
  using (bucket_id = 'portfolio' and auth.role() = 'authenticated');

drop policy if exists "portfolio_admin_delete" on storage.objects;
create policy "portfolio_admin_delete" on storage.objects for delete
  using (bucket_id = 'portfolio' and auth.role() = 'authenticated');
