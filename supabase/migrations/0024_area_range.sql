-- Optional upper bound on area_value, so a property can show a size range (e.g. open
-- plots of varying sizes in the same venture) instead of a single flat number.
alter table public.properties add column if not exists area_value_max numeric;
