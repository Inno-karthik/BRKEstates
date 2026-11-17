-- Up to 3 named 360°/iframe embeds per property (replaces the single embed_code for this
-- purpose — embed_code itself stays for any other one-off embed use).
alter table public.properties add column if not exists virtual_tours jsonb not null default '[]'::jsonb;
