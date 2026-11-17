-- Site-wide analytics: richer lead_events + one aggregate RPC for the CRM dashboard.

alter table public.lead_events drop constraint if exists lead_events_event_type_check;
alter table public.lead_events add constraint lead_events_event_type_check check (event_type in (
  'page_view', 'property_view', 'property_click',
  'whatsapp_click', 'call_click', 'email_click', 'directions_click',
  'cta_click', 'social_click', 'brochure_download', 'share_click',
  'search', 'favorite_add', 'compare_add',
  'chat_open', 'chat_lead'
));

alter table public.lead_events
  add column if not exists path text,
  add column if not exists referrer text,
  add column if not exists device text,
  add column if not exists visitor_id text,
  add column if not exists session_id text,
  add column if not exists label text;

-- keep anonymous public inserts bounded
alter table public.lead_events drop constraint if exists lead_events_len_check;
alter table public.lead_events add constraint lead_events_len_check check (
  coalesce(char_length(path), 0) <= 300 and coalesce(char_length(referrer), 0) <= 200
  and coalesce(char_length(label), 0) <= 300 and coalesce(char_length(visitor_id), 0) <= 64
  and coalesce(char_length(session_id), 0) <= 64 and coalesce(char_length(device), 0) <= 16
);

create index if not exists idx_lead_events_created on public.lead_events(created_at desc);
create index if not exists idx_lead_events_visitor on public.lead_events(visitor_id);

create or replace function public.crm_analytics(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d int := greatest(1, least(coalesce(p_days, 30), 365));
  since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)));
  prev_since timestamptz := now() - make_interval(days => 2 * greatest(1, least(coalesce(p_days, 30), 365)));
  today date := (now() at time zone 'Asia/Kolkata')::date;
  result jsonb;
begin
  if not public.has_section('crm') then
    raise exception 'not allowed';
  end if;

  with ev as (select * from public.lead_events where created_at >= since),
       pv as (select * from public.lead_events where created_at >= prev_since and created_at < since),
       contact_types as (select unnest(array['call_click','whatsapp_click','email_click','chat_lead']) as t)
  select jsonb_build_object(
    'days', d,
    'by_type', (select coalesce(jsonb_object_agg(event_type, c), '{}'::jsonb)
                from (select event_type, count(*) c from ev group by 1) t),
    'visitors', (select count(distinct visitor_id) from ev where visitor_id is not null),
    'sessions', (select count(distinct session_id) from ev where session_id is not null),
    'leads', (select count(*) from public.leads where created_at >= since),
    'prev', jsonb_build_object(
      'page_views', (select count(*) from pv where event_type = 'page_view'),
      'visitors', (select count(distinct visitor_id) from pv where visitor_id is not null),
      'contacts', (select count(*) from pv where event_type in (select t from contact_types)),
      'leads', (select count(*) from public.leads where created_at >= prev_since and created_at < since)
    ),
    'daily', (
      select coalesce(jsonb_agg(to_jsonb(x) order by x.day), '[]'::jsonb) from (
        select g.day::date as day,
          count(*) filter (where e.event_type = 'page_view') as page_views,
          count(distinct e.visitor_id) as visitors,
          count(*) filter (where e.event_type in ('call_click','whatsapp_click','email_click','chat_lead')) as contacts,
          (select count(*) from public.leads l where (l.created_at at time zone 'Asia/Kolkata')::date = g.day::date) as leads
        from generate_series(today - (d - 1), today, interval '1 day') g(day)
        left join ev e on (e.created_at at time zone 'Asia/Kolkata')::date = g.day::date
        group by g.day
      ) x
    ),
    'hourly', (
      select coalesce(jsonb_agg(jsonb_build_object('hour', h, 'views', coalesce(c, 0)) order by h), '[]'::jsonb)
      from generate_series(0, 23) h
      left join (
        select extract(hour from created_at at time zone 'Asia/Kolkata')::int as hr, count(*) c
        from ev where event_type = 'page_view' group by 1
      ) q on q.hr = h
    ),
    'top_pages', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
        select path, count(*) views, count(distinct visitor_id) visitors from ev
        where event_type = 'page_view' and path is not null
        group by path order by views desc limit 10
      ) x
    ),
    'top_properties', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
       select * from (
        select p.id, p.title, p.slug,
          count(*) filter (where e.event_type = 'property_view') as views,
          count(*) filter (where e.event_type = 'call_click') as calls,
          count(*) filter (where e.event_type = 'whatsapp_click') as whatsapp,
          count(*) filter (where e.event_type in ('favorite_add','compare_add')) as saves,
          (select count(*) from public.leads l where l.property_id = p.id and l.created_at >= since) as leads
        from ev e join public.properties p on p.id = e.property_id
        group by p.id, p.title, p.slug
       ) y order by views desc, calls + whatsapp desc limit 10
      ) x
    ),
    'sources', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
        select coalesce(nullif(utm_source, ''), nullif(referrer, ''), 'Direct') as source,
               count(distinct visitor_id) visitors, count(*) views
        from ev where event_type = 'page_view'
        group by 1 order by visitors desc limit 8
      ) x
    ),
    'devices', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
        select coalesce(device, 'unknown') as device, count(distinct visitor_id) visitors
        from ev where event_type = 'page_view' group by 1 order by visitors desc
      ) x
    ),
    'top_ctas', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
        select label, count(*) clicks from ev
        where event_type = 'cta_click' and label is not null group by label order by clicks desc limit 8
      ) x
    ),
    'top_searches', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
        select label, count(*) searches from ev
        where event_type = 'search' and label is not null group by label order by searches desc limit 8
      ) x
    ),
    'funnel', jsonb_build_object(
      'visitors', (select count(distinct visitor_id) from ev where visitor_id is not null),
      'property_viewers', (select count(distinct visitor_id) from ev where event_type = 'property_view' and visitor_id is not null),
      'contacted', (select count(distinct visitor_id) from ev where event_type in (select t from contact_types) and visitor_id is not null),
      'leads', (select count(*) from public.leads where created_at >= since)
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.crm_analytics(int) from public, anon;
grant execute on function public.crm_analytics(int) to authenticated;
