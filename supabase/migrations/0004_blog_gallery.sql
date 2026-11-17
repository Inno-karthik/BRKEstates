-- Blog posts + a standalone site gallery (separate from per-property photos)

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author text default 'BHK Realtors',
  tags jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_blog_posts_status on public.blog_posts(status);

drop trigger if exists trg_blog_posts_updated on public.blog_posts;
create trigger trg_blog_posts_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;
drop policy if exists "blog_posts public read" on public.blog_posts;
create policy "blog_posts public read" on public.blog_posts for select using (status = 'published' or public.is_admin());
drop policy if exists "blog_posts admin write" on public.blog_posts;
create policy "blog_posts admin write" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  category text not null default 'general',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_gallery_images_category on public.gallery_images(category);

alter table public.gallery_images enable row level security;
drop policy if exists "gallery_images public read" on public.gallery_images;
create policy "gallery_images public read" on public.gallery_images for select using (true);
drop policy if exists "gallery_images admin write" on public.gallery_images;
create policy "gallery_images admin write" on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());
