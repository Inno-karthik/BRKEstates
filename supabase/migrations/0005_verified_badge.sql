alter table public.properties
  add column if not exists is_verified boolean not null default false;
