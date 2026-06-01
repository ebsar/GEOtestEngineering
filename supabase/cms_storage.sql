-- Run this in Supabase SQL Editor to allow the visual editor to upload images.
-- The bucket is public because website images must be visible to visitors.

insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read cms media" on storage.objects;
create policy "Public can read cms media"
on storage.objects
for select
using (bucket_id = 'cms-media');

drop policy if exists "Admins can upload cms media" on storage.objects;
create policy "Admins can upload cms media"
on storage.objects
for insert
with check (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update cms media" on storage.objects;
create policy "Admins can update cms media"
on storage.objects
for update
using (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete cms media" on storage.objects;
create policy "Admins can delete cms media"
on storage.objects
for delete
using (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
