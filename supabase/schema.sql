-- Run in Supabase SQL editor. Then: Auth > disable "Allow new users to sign up",
-- and create your single user manually (Auth > Users > Add user).

create extension if not exists "pgcrypto";

create table if not exists site_settings (
  owner_id uuid primary key references auth.users on delete cascade,
  opening jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade default auth.uid(),
  type text not null check (type in ('letter','gallery','slideshow','video','surprise')),
  title text not null default 'Untitled',
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft','published')),
  visibility text not null default 'unlisted' check (visibility in ('public','unlisted','password')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists experience_secrets (
  experience_id uuid primary key references experiences on delete cascade,
  password_hash text not null
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade default auth.uid(),
  kind text not null check (kind in ('photo','video','audio')),
  path text not null,
  url text not null,
  name text not null,
  size bigint not null default 0,
  created_at timestamptz default now()
);

create table if not exists render_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade default auth.uid(),
  experience_id uuid references experiences on delete set null,
  status text not null default 'queued' check (status in ('queued','rendering','done','failed')),
  progress int not null default 0,
  props jsonb not null,            -- snapshot of the project at render time
  settings jsonb not null,         -- {aspect, quality, fps}
  output_url text,
  error text,
  attempts int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists render_jobs_status_idx on render_jobs(status, created_at);

alter table site_settings enable row level security;
alter table experiences enable row level security;
alter table experience_secrets enable row level security;
alter table media enable row level security;
alter table render_jobs enable row level security;

create policy "owner all" on site_settings for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "anon read opening" on site_settings for select using (true);

create policy "owner all" on experiences for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "public read published" on experiences for select
  using (status = 'published' and visibility in ('public','unlisted'));

create policy "owner all" on experience_secrets for all
  using (exists (select 1 from experiences e where e.id = experience_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from experiences e where e.id = experience_id and e.owner_id = auth.uid()));

create policy "owner all" on media for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner all" on render_jobs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger t_exp before update on experiences for each row execute function touch_updated_at();
create trigger t_job before update on render_jobs for each row execute function touch_updated_at();

-- Storage: public-read bucket (unguessable paths), owner-only write.
insert into storage.buckets (id, name, public) values ('media','media', true) on conflict do nothing;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media owner write" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "media owner update" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "media owner delete" on storage.objects for delete to authenticated using (bucket_id = 'media');
