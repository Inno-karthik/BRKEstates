-- Admin-curated nearby places per property (schools, hospitals, malls, etc. found via Ola Places search)
create table if not exists public.property_nearby_places (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  category text not null default 'general',
  place_id text,
  latitude double precision not null,
  longitude double precision not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_nearby_places_property on public.property_nearby_places(property_id);

alter table public.property_nearby_places enable row level security;
drop policy if exists "nearby_places public read" on public.property_nearby_places;
create policy "nearby_places public read" on public.property_nearby_places for select using (
  public.is_admin() or exists (select 1 from public.properties p where p.id = property_id and p.status in ('published','sold'))
);
drop policy if exists "nearby_places admin write" on public.property_nearby_places;
create policy "nearby_places admin write" on public.property_nearby_places for all using (public.is_admin()) with check (public.is_admin());

-- Marketing settings (pixels, ads, WhatsApp) — managed from the CRM, not the CMS settings page
alter table public.site_settings
  add column if not exists google_ads_conversion_id text,
  add column if not exists google_ads_conversion_label text,
  add column if not exists whatsapp_default_message text default 'Hi, I''m interested in your properties.';
