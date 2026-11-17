create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  meta_title text,
  meta_description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists location_properties (
  location_id uuid not null references locations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  primary key (location_id, property_id)
);

create index if not exists location_properties_property_id_idx on location_properties(property_id);

alter table locations enable row level security;
alter table location_properties enable row level security;

drop policy if exists "admin manage locations" on locations;
create policy "admin manage locations" on locations
  for all using (is_admin()) with check (is_admin());

drop policy if exists "public read active locations" on locations;
create policy "public read active locations" on locations
  for select using (is_active = true);

drop policy if exists "admin manage location_properties" on location_properties;
create policy "admin manage location_properties" on location_properties
  for all using (is_admin()) with check (is_admin());

drop policy if exists "public read location_properties" on location_properties;
create policy "public read location_properties" on location_properties
  for select using (
    exists (select 1 from locations l where l.id = location_id and l.is_active = true)
  );
