-- Popups targeted to "property" pages can optionally be scoped to one specific property
-- instead of every property page.
alter table public.popups add column if not exists property_id uuid references public.properties(id) on delete set null;
