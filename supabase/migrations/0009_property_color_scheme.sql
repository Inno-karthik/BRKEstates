-- Color scheme moves from property_types (fixed, admin-unmanaged) to individual properties.
alter table public.properties
  add column if not exists color_scheme text not null default 'emerald';
