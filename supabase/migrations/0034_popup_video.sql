-- Popups can be an image or a video (portrait or landscape).
alter table public.popups add column if not exists media_type text not null default 'image';
alter table public.popups add column if not exists video_url text;
alter table public.popups drop constraint if exists popups_media_type_check;
alter table public.popups add constraint popups_media_type_check check (media_type in ('image', 'video'));
