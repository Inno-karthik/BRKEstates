-- Free-text note shown in a highlighted box under the unit configurations (all property types).
alter table public.properties add column if not exists variant_notes text;
