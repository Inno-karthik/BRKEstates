create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_id_idx on lead_notes(lead_id);

alter table lead_notes enable row level security;

drop policy if exists "admin manage lead notes" on lead_notes;
create policy "admin manage lead notes" on lead_notes
  for all using (is_admin()) with check (is_admin());
