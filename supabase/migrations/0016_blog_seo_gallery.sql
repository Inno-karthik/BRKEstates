alter table blog_posts
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;
