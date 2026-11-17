-- Toggle for the "all properties on one map" section on the homepage — controlled from
-- the admin Locations page since it's a map/locations-adjacent feature.
alter table public.site_settings add column if not exists home_map_enabled boolean not null default true;
