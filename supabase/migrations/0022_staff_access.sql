-- Multi-user staff access: the owner ("admin") can create additional logins scoped to
-- specific top-level sections (cms/crm/vault) and, within cms, specific areas. Staff can
-- never delete anything — delete stays admin-only everywhere.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'staff'));
alter table public.profiles alter column role set default 'staff';
alter table public.profiles add column if not exists sections text[] not null default '{}';
alter table public.profiles add column if not exists cms_areas text[] not null default '{}';

-- IMPORTANT: handle_new_user() previously defaulted every new signup to role='admin'
-- (fine when this app had exactly one admin account). Now that staff logins are created
-- via the admin API, that would silently grant full access to every new user. New
-- accounts now start as 'staff' with zero sections — no access until explicitly granted.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.has_section(section text)
returns boolean as $$
  select public.is_admin() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'staff' and section = any(sections)
  );
$$ language sql stable security definer set search_path = public;

create or replace function public.has_cms_area(area text)
returns boolean as $$
  select public.is_admin() or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'staff'
      and 'cms' = any(sections) and area = any(cms_areas)
  );
$$ language sql stable security definer set search_path = public;

-- ===== properties (area: properties) =====
drop policy if exists "properties public read" on public.properties;
create policy "properties public read" on public.properties for select using (
  status = 'published' or public.has_cms_area('properties')
);
drop policy if exists "properties admin write" on public.properties;
create policy "properties insert" on public.properties for insert with check (public.has_cms_area('properties'));
create policy "properties update" on public.properties for update using (public.has_cms_area('properties')) with check (public.has_cms_area('properties'));
create policy "properties delete" on public.properties for delete using (public.is_admin());

drop policy if exists "property_images public read" on public.property_images;
create policy "property_images public read" on public.property_images for select using (
  public.has_cms_area('properties') or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
);
drop policy if exists "property_images admin write" on public.property_images;
create policy "property_images insert" on public.property_images for insert with check (public.has_cms_area('properties'));
create policy "property_images update" on public.property_images for update using (public.has_cms_area('properties')) with check (public.has_cms_area('properties'));
create policy "property_images delete" on public.property_images for delete using (public.is_admin());

drop policy if exists "property_brochures public read" on public.property_brochures;
create policy "property_brochures public read" on public.property_brochures for select using (
  public.has_cms_area('properties') or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
);
drop policy if exists "property_brochures admin write" on public.property_brochures;
create policy "property_brochures insert" on public.property_brochures for insert with check (public.has_cms_area('properties'));
create policy "property_brochures update" on public.property_brochures for update using (public.has_cms_area('properties')) with check (public.has_cms_area('properties'));
create policy "property_brochures delete" on public.property_brochures for delete using (public.is_admin());

drop policy if exists "property_amenities public read" on public.property_amenities;
create policy "property_amenities public read" on public.property_amenities for select using (
  public.has_cms_area('properties') or exists (select 1 from public.properties p where p.id = property_id and p.status = 'published')
);
drop policy if exists "property_amenities admin write" on public.property_amenities;
create policy "property_amenities insert" on public.property_amenities for insert with check (public.has_cms_area('properties'));
create policy "property_amenities update" on public.property_amenities for update using (public.has_cms_area('properties')) with check (public.has_cms_area('properties'));
create policy "property_amenities delete" on public.property_amenities for delete using (public.is_admin());

drop policy if exists "nearby_places public read" on public.property_nearby_places;
create policy "nearby_places public read" on public.property_nearby_places for select using (
  public.has_cms_area('properties') or exists (select 1 from public.properties p where p.id = property_id and p.status in ('published','sold'))
);
drop policy if exists "nearby_places admin write" on public.property_nearby_places;
create policy "nearby_places insert" on public.property_nearby_places for insert with check (public.has_cms_area('properties'));
create policy "nearby_places update" on public.property_nearby_places for update using (public.has_cms_area('properties')) with check (public.has_cms_area('properties'));
create policy "nearby_places delete" on public.property_nearby_places for delete using (public.is_admin());

-- ===== property_types / attribute_definitions (area: property-types) =====
drop policy if exists "property_types public read" on public.property_types;
create policy "property_types public read" on public.property_types for select using (is_active or public.has_cms_area('property-types'));
drop policy if exists "property_types admin write" on public.property_types;
create policy "property_types insert" on public.property_types for insert with check (public.has_cms_area('property-types'));
create policy "property_types update" on public.property_types for update using (public.has_cms_area('property-types')) with check (public.has_cms_area('property-types'));
create policy "property_types delete" on public.property_types for delete using (public.is_admin());

drop policy if exists "attribute_definitions admin write" on public.attribute_definitions;
create policy "attribute_definitions insert" on public.attribute_definitions for insert with check (public.has_cms_area('property-types'));
create policy "attribute_definitions update" on public.attribute_definitions for update using (public.has_cms_area('property-types')) with check (public.has_cms_area('property-types'));
create policy "attribute_definitions delete" on public.attribute_definitions for delete using (public.is_admin());

-- ===== amenities (area: amenities) =====
drop policy if exists "amenities public read" on public.amenities;
create policy "amenities public read" on public.amenities for select using (is_active or public.has_cms_area('amenities'));
drop policy if exists "amenities admin write" on public.amenities;
create policy "amenities insert" on public.amenities for insert with check (public.has_cms_area('amenities'));
create policy "amenities update" on public.amenities for update using (public.has_cms_area('amenities')) with check (public.has_cms_area('amenities'));
create policy "amenities delete" on public.amenities for delete using (public.is_admin());

drop policy if exists "amenity_property_types admin write" on public.amenity_property_types;
create policy "amenity_property_types insert" on public.amenity_property_types for insert with check (public.has_cms_area('amenities'));
create policy "amenity_property_types update" on public.amenity_property_types for update using (public.has_cms_area('amenities')) with check (public.has_cms_area('amenities'));
create policy "amenity_property_types delete" on public.amenity_property_types for delete using (public.is_admin());

-- ===== locations (area: locations) =====
create policy "locations staff read" on public.locations for select using (public.has_cms_area('locations'));
drop policy if exists "admin manage locations" on public.locations;
create policy "locations insert" on public.locations for insert with check (public.has_cms_area('locations'));
create policy "locations update" on public.locations for update using (public.has_cms_area('locations')) with check (public.has_cms_area('locations'));
create policy "locations delete" on public.locations for delete using (public.is_admin());

create policy "location_properties staff read" on public.location_properties for select using (public.has_cms_area('locations'));
drop policy if exists "admin manage location_properties" on public.location_properties;
create policy "location_properties insert" on public.location_properties for insert with check (public.has_cms_area('locations'));
create policy "location_properties update" on public.location_properties for update using (public.has_cms_area('locations')) with check (public.has_cms_area('locations'));
create policy "location_properties delete" on public.location_properties for delete using (public.is_admin());

-- ===== blog_posts (area: blog) =====
drop policy if exists "blog_posts public read" on public.blog_posts;
create policy "blog_posts public read" on public.blog_posts for select using (status = 'published' or public.has_cms_area('blog'));
drop policy if exists "blog_posts admin write" on public.blog_posts;
create policy "blog_posts insert" on public.blog_posts for insert with check (public.has_cms_area('blog'));
create policy "blog_posts update" on public.blog_posts for update using (public.has_cms_area('blog')) with check (public.has_cms_area('blog'));
create policy "blog_posts delete" on public.blog_posts for delete using (public.is_admin());

-- ===== popups: multiple can be active at once, each targeted to specific pages =====
alter table public.popups add column if not exists pages text[] not null default '{}';

-- ===== popups (area: popups) =====
drop policy if exists "popups public read" on public.popups;
create policy "popups public read" on public.popups for select using (
  (is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()))
  or public.has_cms_area('popups')
);
drop policy if exists "popups admin write" on public.popups;
create policy "popups insert" on public.popups for insert with check (public.has_cms_area('popups'));
create policy "popups update" on public.popups for update using (public.has_cms_area('popups')) with check (public.has_cms_area('popups'));
create policy "popups delete" on public.popups for delete using (public.is_admin());

-- ===== site_settings (area: settings) — singleton row, no insert/delete needed =====
drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings update" on public.site_settings for update using (public.has_cms_area('settings')) with check (public.has_cms_area('settings'));

-- ===== leads / lead_events / lead_notes (section: crm) =====
drop policy if exists "leads admin read" on public.leads;
create policy "leads read" on public.leads for select using (public.has_section('crm'));
drop policy if exists "leads admin write" on public.leads;
create policy "leads update" on public.leads for update using (public.has_section('crm')) with check (public.has_section('crm'));
drop policy if exists "leads admin delete" on public.leads;
create policy "leads delete" on public.leads for delete using (public.is_admin());

drop policy if exists "lead_events admin read" on public.lead_events;
create policy "lead_events read" on public.lead_events for select using (public.has_section('crm'));

drop policy if exists "admin manage lead notes" on public.lead_notes;
create policy "lead_notes read" on public.lead_notes for select using (public.has_section('crm'));
create policy "lead_notes insert" on public.lead_notes for insert with check (public.has_section('crm'));
create policy "lead_notes delete" on public.lead_notes for delete using (public.is_admin());

-- ===== property_documents (section: vault) =====
drop policy if exists "admin manage documents" on public.property_documents;
create policy "property_documents read" on public.property_documents for select using (public.has_section('vault'));
create policy "property_documents insert" on public.property_documents for insert with check (public.has_section('vault'));
create policy "property_documents update" on public.property_documents for update using (public.has_section('vault')) with check (public.has_section('vault'));
create policy "property_documents delete" on public.property_documents for delete using (public.is_admin());
