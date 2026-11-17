alter table properties
  add column if not exists total_units integer,
  add column if not exists available_units integer,
  add column if not exists unit_variants jsonb not null default '[]'::jsonb;
