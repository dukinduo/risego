-- Run this SQL in the Supabase SQL editor to create the required posts table with proper RLS policies.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  username text not null,
  full_name text not null,
  is_verified boolean not null default false,
  caption text,
  image_url text,
  likes integer not null default 0,
  comments integer not null default 0,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policy: Allow everyone to read posts
create policy "Allow everyone to read posts"
  on public.posts for select
  using (true);

-- Policy: Allow authenticated users to create posts
create policy "Allow authenticated users to create posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Policy: Allow users to update their own posts
create policy "Allow users to update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- Policy: Allow users to delete their own posts
create policy "Allow users to delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);
