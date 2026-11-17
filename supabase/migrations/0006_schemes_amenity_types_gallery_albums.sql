-- 1) Color schemes per property type (replaces free-form per-page theme editor)
alter table public.property_types
  add column if not exists color_scheme text not null default 'emerald';

-- 2) Amenities: drop category, scope to property type(s) via join table
alter table public.amenities drop column if exists category;

create table if not exists public.amenity_property_types (
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  property_type_id uuid not null references public.property_types(id) on delete cascade,
  primary key (amenity_id, property_type_id)
);

alter table public.amenity_property_types enable row level security;
drop policy if exists "amenity_property_types public read" on public.amenity_property_types;
create policy "amenity_property_types public read" on public.amenity_property_types for select using (true);
drop policy if exists "amenity_property_types admin write" on public.amenity_property_types;
create policy "amenity_property_types admin write" on public.amenity_property_types for all using (public.is_admin()) with check (public.is_admin());

-- 3) Gallery restructured as albums (like blog posts), replacing the flat image stream
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_gallery_albums_updated on public.gallery_albums;
create trigger trg_gallery_albums_updated before update on public.gallery_albums
  for each row execute function public.set_updated_at();

create table if not exists public.gallery_album_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  url text not null,
  caption text,
  sort_order int not null default 0
);
create index if not exists idx_gallery_album_images_album on public.gallery_album_images(album_id);

alter table public.gallery_albums enable row level security;
drop policy if exists "gallery_albums public read" on public.gallery_albums;
create policy "gallery_albums public read" on public.gallery_albums for select using (status = 'published' or public.is_admin());
drop policy if exists "gallery_albums admin write" on public.gallery_albums;
create policy "gallery_albums admin write" on public.gallery_albums for all using (public.is_admin()) with check (public.is_admin());

alter table public.gallery_album_images enable row level security;
drop policy if exists "gallery_album_images public read" on public.gallery_album_images;
create policy "gallery_album_images public read" on public.gallery_album_images for select using (
  public.is_admin() or exists (select 1 from public.gallery_albums a where a.id = album_id and a.status = 'published')
);
drop policy if exists "gallery_album_images admin write" on public.gallery_album_images;
create policy "gallery_album_images admin write" on public.gallery_album_images for all using (public.is_admin()) with check (public.is_admin());

drop table if exists public.gallery_images;
