alter table blog_posts
  add column if not exists translations jsonb default '{}';
