-- Site-wide promotional popups (offers, festival greetings) — optional image + optional target URL.
create table if not exists public.popups (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Popup',
  image_url text,
  target_url text,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_popups_updated on public.popups;
create trigger trg_popups_updated before update on public.popups
  for each row execute function public.set_updated_at();

alter table public.popups enable row level security;
drop policy if exists "popups public read" on public.popups;
create policy "popups public read" on public.popups for select using (
  is_active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
  or public.is_admin()
);
drop policy if exists "popups admin write" on public.popups;
create policy "popups admin write" on public.popups for all using (public.is_admin()) with check (public.is_admin());
