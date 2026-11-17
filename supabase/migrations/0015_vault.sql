-- Vault: per-property document storage (contracts, approvals, brochures, etc) with
-- optional access-key gating for confidential files, and a public per-project share page.

create table if not exists property_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  title text not null,
  file_url text not null,
  is_confidential boolean not null default false,
  access_key text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists property_documents_property_id_idx on property_documents(property_id);

alter table property_documents enable row level security;

-- Admin-only at the row level. Public access to confidential files is mediated
-- entirely through a server route that checks the access key — never a public
-- SELECT policy — so a confidential file_url/access_key is never shipped to the
-- browser unless the key matches. Non-confidential titles/urls for a published
-- property are readable publicly (for the vault share page).
drop policy if exists "admin manage documents" on property_documents;
create policy "admin manage documents" on property_documents
  for all using (is_admin()) with check (is_admin());

drop policy if exists "public read non-confidential documents" on property_documents;
create policy "public read non-confidential documents" on property_documents
  for select using (
    is_confidential = false
    and exists (select 1 from properties p where p.id = property_id and p.status = 'published')
  );
