-- Adds: geolocation + map precision, optional embed codes, media kind tagging,
-- richer lead pipeline + UTM attribution, click-event tracking, and marketing pixel settings.
-- Informed by the BHK Realtors Property Onboarding Bible (sections 05, 11, 15) and the
-- paid-ads attribution flow (Meta/Google pixels -> UTM -> conversions).

-- ===== properties: location precision + optional embeds =====
alter table public.properties
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists map_precision text not null default 'approximate'
    check (map_precision in ('exact', 'approximate', 'locality')),
  add column if not exists embed_code text;

alter table public.properties drop constraint if exists properties_status_check;
alter table public.properties
  add constraint properties_status_check
  check (status in ('draft', 'published', 'paused', 'sold', 'archived'));

-- published OR sold stay publicly visible (sold is clearly labeled, not hidden); paused/draft/archived are not
drop policy if exists "properties public read" on public.properties;
create policy "properties public read" on public.properties for select using (
  status in ('published', 'sold') or public.is_admin()
);

-- ===== property_images: distinguish actual photos from floor plans / renders =====
alter table public.property_images
  add column if not exists kind text not null default 'photo'
    check (kind in ('photo', 'floor_plan', 'render'));

-- ===== leads: richer pipeline + campaign attribution =====
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists landing_page text;

update public.leads set status = 'new' where status not in (
  'new','contacted','qualified','site_visit_planned','visited','negotiation','won','lost','inactive','duplicate'
);

alter table public.leads
  add constraint leads_status_check
  check (status in ('new','contacted','qualified','site_visit_planned','visited','negotiation','won','lost','inactive','duplicate'));

-- ===== click/view events — measured separately from verified leads =====
create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('whatsapp_click', 'call_click', 'page_view')),
  property_id uuid references public.properties(id) on delete set null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);
create index if not exists idx_lead_events_property on public.lead_events(property_id);
create index if not exists idx_lead_events_type on public.lead_events(event_type);

alter table public.lead_events enable row level security;
drop policy if exists "lead_events public insert" on public.lead_events;
create policy "lead_events public insert" on public.lead_events for insert with check (true);
drop policy if exists "lead_events admin read" on public.lead_events;
create policy "lead_events admin read" on public.lead_events for select using (public.is_admin());

-- ===== site_settings: marketing pixels (admin-editable, end to end) =====
alter table public.site_settings
  add column if not exists meta_pixel_id text,
  add column if not exists google_tag_id text;
