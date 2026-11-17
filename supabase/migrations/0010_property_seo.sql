alter table public.properties
  add column if not exists meta_title text,
  add column if not exists meta_description text;
