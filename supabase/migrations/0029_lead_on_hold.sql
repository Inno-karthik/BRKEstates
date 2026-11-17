-- Add an "on_hold" CRM lead status.
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in ('new','contacted','qualified','site_visit_planned','visited','negotiation','on_hold','won','lost','inactive','duplicate'));
