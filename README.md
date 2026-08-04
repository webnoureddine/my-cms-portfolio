# my-cms-portfolio
my cms portfolio

# Portfolio — now backed by a real database

Your portfolio no longer hardcodes projects, skills, or bio text in the code.
Everything lives in a **Supabase** (Postgres) database, and you edit it from
a built-in admin panel at `/admin` — no code changes, no redeploy needed for
content updates.

**Why Supabase:** it's a free, hosted Postgres database with a REST API,
authentication, and file storage all included, and the React app talks to it
directly — there's no separate backend server to build, host, or maintain.
That's what makes this "easy": one service handles your data, your admin
login, and your uploaded images.

---

## What you get

- **Public site** (`/`) — reads live data from the database (settings, projects, skills).
- **Admin CMS** (`/admin`) — password-protected, lets you:
  - See a **Dashboard**: total visits, visits today, a 14-day visits chart, message counts, project/skill counts
  - Edit your name, location, bio (EN/FR), contact links, availability badge, profile photo, and your CV/resume PDF
  - Add / edit / delete projects (title, description, tech stack, links, thumbnail, screenshot gallery)
  - Add / edit / delete skill categories and the tools list
  - Read messages submitted through your public contact form
- Image and CV uploads go straight to Supabase Storage — no need to touch code or redeploy to swap a picture or resume.
- Changes appear on the live site instantly (real-time subscription), and are also picked up on refresh.
- The public site logs one row per visit to power the Dashboard's visit stats.

---

## If you already ran schema.sql before (updating an existing project)

Run `supabase/migration_2.sql` once in the Supabase SQL editor — it adds the
`cv_url` column and `page_views` table this update introduced, without
touching your existing data. Safe to run more than once.

If this is a brand new project, just run `supabase/schema.sql` — it already
includes everything.

---

## 1. Create your Supabase project (2 minutes)

1. Go to **https://supabase.com** → sign up (free) → **New project**.
2. Pick a name, a database password (save it somewhere safe), and a region close to you.
3. Wait ~1 minute for it to finish provisioning.

## 2. Create the database tables

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file `supabase/schema.sql` from this project, copy **all of it**, paste it into the SQL editor, and click **Run**.
3. This creates the `settings`, `projects`, `skills`, and `messages` tables, sets up security rules (public can read/submit, only you can write), creates a public `portfolio` storage bucket for images, and seeds it with your existing content so the site isn't empty.

## 3. Create your admin login

1. In Supabase: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter the email and password you want to use to log into `/admin`. Confirm the email checkbox is enabled so you don't need to click a verification link (or verify it via the email Supabase sends).
3. That's your only login — this app expects a single admin account.

## 4. Get your API keys

1. In Supabase: **Project Settings** → **API**.
2. Copy the **Project URL** and the **anon public** key (not the `service_role` key — never expose that one in a frontend app).

## 5. Configure the app locally

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-public-key
```

## 6. Run it

```bash
npm install
npm start
```

- Visit `http://localhost:3000` for the public site.
- Visit `http://localhost:3000/admin` and log in with the account you created in step 3.

---

## Deploying online (Vercel — easiest option)

1. Push this project to a GitHub repo (or use Vercel's "drag and drop" deploy for a zip).
2. Go to **https://vercel.com** → **New Project** → import your repo.
3. In **Environment Variables**, add:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
4. Framework preset: Create React App (auto-detected). Click **Deploy**.
5. Since this uses client-side routing (`/admin`), add a `vercel.json` rewrite (already included in this project) so refreshing `/admin` doesn't 404.

Netlify works the same way: connect the repo, set the same two environment
variables in **Site settings → Environment variables**, and the included
`public/_redirects` file handles the client-side routing.

You do **not** need to redeploy the frontend when you edit content — only
when you change the code itself. All content edits happen live in the
database via `/admin`.

---

## Editing content day-to-day

Just go to `yoursite.com/admin`, log in, and use the tabs:

- **Dashboard** — visits, messages, and content stats at a glance.
- **Settings** — name, location, contact links, availability, bio text (EN/FR), profile photo, CV/resume PDF.
- **Projects** — add/edit/delete projects, upload a thumbnail and screenshot gallery, set sort order.
- **Skills** — edit skill categories and levels, and the tools list.
- **Messages** — read what people sent you through the contact form.

Everything saves straight to Supabase and shows up on the public site immediately.

---

## Project structure

```
src/
  supabaseClient.js         # Supabase connection (reads .env)
  componants/
    usePortfolioData.js     # fetches settings/projects/skills, live-updates
    AdminPage.js            # the /admin CMS (auth + CRUD + image upload)
    Home.js, About.js, Skills.js, Projects.js, Contact.js, Navbar.js
supabase/
  schema.sql                # run this once in the Supabase SQL editor
```

## Notes

- The contact form on the public site writes into the `messages` table (readable only by you, from `/admin`).
- Images you upload from `/admin` are stored in the public `portfolio` bucket in Supabase Storage.
- If you ever need a second admin, just add another user in Supabase Authentication — there's no user limit.
