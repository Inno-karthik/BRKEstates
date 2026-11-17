-- BHK Realtors — initial schema
create extension if not exists pgcrypto;

-- ========== profiles (admin gate) ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- ========== site settings (singleton) ==========
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'BHK Realtors',
  logo_url text,
  favicon_url text,
  phone text,
  email text,
  whatsapp text,
  address text,
  facebook_url text,
  instagram_url text,
  youtube_url text,
  twitter_url text,
  footer_text text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ========== property types (admin-driven, dynamic) ==========
create table if not exists public.property_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon_name text,
  icon_url text,
  accent_color text default '#1b5e3a',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== attribute definitions (per property type, dynamic fields) ==========
create table if not exists public.attribute_definitions (
  id uuid primary key default gen_random_uuid(),
  property_type_id uuid not null references public.property_types(id) on delete cascade,
  key text not null,
  label text not null,
  field_type text not null check (field_type in ('number','text','select','multiselect','boolean')),
  unit text,
  options jsonb default '[]'::jsonb,
  icon_name text,
  is_filterable boolean not null default true,
  is_required boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (property_type_id, key)
);

-- ========== amenities (admin-driven, icon sets) ==========
create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon_name text,
  icon_url text,
  category text default 'general',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ========== properties ==========
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type_id uuid not null references public.property_types(id),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  price numeric,
  price_label text,
  location text,
  city text,
  state text,
  area_value numeric,
  area_unit text default 'sqft',
  description text,
  cover_image text,
  featured boolean not null default false,
  attributes jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_properties_type on public.properties(type_id);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_attributes on public.properties using gin (attributes);

-- ========== property images ==========
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_property_images_property on public.property_images(property_id);

-- ========== property brochure (optional PDF) ==========
create table if not exists public.property_brochures (
  property_id uuid primary key references public.properties(id) on delete cascade,
  pdf_url text not null,
  updated_at timestamptz not null default now()
);

-- ========== property <-> amenities ==========
create table if not exists public.property_amenities (
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- ========== leads / enquiries ==========
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text,
  property_id uuid references public.properties(id) on delete set null,
  source text default 'website',
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);

-- ========== page themes (per-page admin color control) ==========
create table if not exists public.page_themes (
  page_key text primary key,
  tokens jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.page_themes (page_key, tokens) values
  ('home', '{"primary":"#1b5e3a","secondary":"#0f3d26","accent":"#d4af37","background":"#ffffff","text":"#14241c"}'),
  ('listings', '{"primary":"#1b5e3a","secondary":"#0f3d26","accent":"#d4af37","background":"#f7faf8","text":"#14241c"}'),
  ('property_detail', '{"primary":"#1b5e3a","secondary":"#0f3d26","accent":"#d4af37","background":"#ffffff","text":"#14241c"}'),
  ('about', '{"primary":"#1b5e3a","secondary":"#0f3d26","accent":"#d4af37","background":"#ffffff","text":"#14241c"}'),
  ('contact', '{"primary":"#1b5e3a","secondary":"#0f3d26","accent":"#d4af37","background":"#ffffff","text":"#14241c"}')
on conflict (page_key) do nothing;

-- ========== updated_at triggers ==========
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_property_types_updated on public.property_types;
create trigger trg_property_types_updated before update on public.property_types
  for each row execute function public.set_updated_at();

drop trigger if exists trg_properties_updated on public.properties;
create trigger trg_properties_updated before update on public.properties
  for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_page_themes_updated on public.page_themes;
create trigger trg_page_themes_updated before update on public.page_themes
  for each row execute function public.set_updated_at();

-- ========== RLS ==========
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.property_types enable row level security;
alter table public.attribute_definitions enable row level security;
alter table public.amenities enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_brochures enable row level security;
alter table public.property_amenities enable row level security;
alter table public.leads enable row level security;
alter table public.page_themes enable row level security;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

-- profiles: self + admin
drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles admin write" on public.profiles;
create policy "profiles admin write" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- site settings: public read, admin write
drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read" on public.site_settings for select using (true);
drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- property_types: public read active, admin full
drop policy if exists "property_types public read" on public.property_types;
create policy "property_types public read" on public.property_types for select using (is_active or public.is_admin());
drop policy if exists "property_types admin write" on public.property_types;
create policy "property_types admin write" on public.property_types for all using (public.is_admin()) with check (public.is_admin());

-- attribute_definitions: public read, admin write
drop policy if exists "attribute_definitions public read" on public.attribute_definitions;
create policy "attribute_definitions public read" on public.attribute_definitions for select using (true);
drop policy if exists "attribute_definitions admin write" on public.attribute_definitions;
create policy "attribute_definitions admin write" on public.attribute_definitions for all using (public.is_admin()) with check (public.is_admin());

-- amenities: public read active, admin full
drop policy if exists "amenities public read" on public.amenities;
create policy "amenities public read" on public.amenities for select using (is_active or public.is_admin());
drop policy if exists "amenities admin write" on public.amenities;
create policy "amenities admin write" on public.amenities for all using (public.is_admin()) with check (public.is_admin());

-- properties: public read published, admin full
drop policy if exists "properties public read" on public.properties;
create policy "properties public read" on public.properties for select using (status = 'published' or public.is_admin());
drop policy if exists "properties admin write" on public.properties;
create policy "properties admin write" on public.properties for all using (public.is_admin()) with check (public.is_admin());

-- property_images: follow parent property visibility
drop policy if exists "property_images public read" on public.property_images;
create policy "property_images public read" on public.property_images for select using (
  public.is_admin() or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
);
drop policy if exists "property_images admin write" on public.property_images;
create policy "property_images admin write" on public.property_images for all using (public.is_admin()) with check (public.is_admin());

-- property_brochures
drop policy if exists "property_brochures public read" on public.property_brochures;
create policy "property_brochures public read" on public.property_brochures for select using (
  public.is_admin() or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
);
drop policy if exists "property_brochures admin write" on public.property_brochures;
create policy "property_brochures admin write" on public.property_brochures for all using (public.is_admin()) with check (public.is_admin());

-- property_amenities
drop policy if exists "property_amenities public read" on public.property_amenities;
create policy "property_amenities public read" on public.property_amenities for select using (
  public.is_admin() or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
);
drop policy if exists "property_amenities admin write" on public.property_amenities;
create policy "property_amenities admin write" on public.property_amenities for all using (public.is_admin()) with check (public.is_admin());

-- leads: anyone can insert (guest enquiry), only admin can read/update
drop policy if exists "leads public insert" on public.leads;
create policy "leads public insert" on public.leads for insert with check (true);
drop policy if exists "leads admin read" on public.leads;
create policy "leads admin read" on public.leads for select using (public.is_admin());
drop policy if exists "leads admin write" on public.leads;
create policy "leads admin write" on public.leads for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "leads admin delete" on public.leads;
create policy "leads admin delete" on public.leads for delete using (public.is_admin());

-- page_themes: public read, admin write
drop policy if exists "page_themes public read" on public.page_themes;
create policy "page_themes public read" on public.page_themes for select using (true);
drop policy if exists "page_themes admin write" on public.page_themes;
create policy "page_themes admin write" on public.page_themes for all using (public.is_admin()) with check (public.is_admin());

-- auto-create profile row (as admin) when a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
