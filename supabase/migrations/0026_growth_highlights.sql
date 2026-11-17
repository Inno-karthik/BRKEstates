-- Admin-authored "Future Growth" highlights per property (title + subtitle each),
-- shown publicly alongside specs/amenities/certifications.
alter table public.properties add column if not exists growth_highlights jsonb not null default '[]'::jsonb;
