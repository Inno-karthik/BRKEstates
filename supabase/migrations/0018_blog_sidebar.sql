alter table site_settings
  add column if not exists blog_sidebar_title text,
  add column if not exists blog_sidebar_property_ids uuid[] default '{}',
  add column if not exists page_seo jsonb default '{}';
