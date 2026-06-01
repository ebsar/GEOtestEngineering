-- Run this after creating the CMS tables and after creating your Supabase auth user.
-- Replace the placeholder UUID in the insert with your own auth.users.id.

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp not null default now()
);

-- Example:
-- insert into admin_users (user_id)
-- values ('00000000-0000-0000-0000-000000000000')
-- on conflict (user_id) do nothing;

alter table website_sections enable row level security;
alter table website_cards enable row level security;
alter table admin_users enable row level security;

drop policy if exists "Published sections are public" on website_sections;
create policy "Published sections are public"
on website_sections
for select
using (
  is_published = true
  or exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins manage sections" on website_sections;
create policy "Admins manage sections"
on website_sections
for all
using (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Published cards are public" on website_cards;
create policy "Published cards are public"
on website_cards
for select
using (
  is_published = true
  or exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins manage cards" on website_cards;
create policy "Admins manage cards"
on website_cards
for all
using (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can read admin list" on admin_users;
create policy "Admins can read admin list"
on admin_users
for select
using (user_id = auth.uid());
