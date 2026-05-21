-- Run this SQL in the Supabase SQL editor to create the follows table.
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id),
  following_id uuid not null references auth.users(id),
  created_at timestamp with time zone not null default now(),
  primary key (follower_id, following_id)
);

-- Enable RLS
alter table public.follows enable row level security;

-- Policy: Allow everyone to see follows
create policy "Allow everyone to read follows"
  on public.follows for select
  using (true);

-- Policy: Allow authenticated users to follow others
create policy "Allow authenticated users to follow"
  on public.follows for insert
  with check (auth.uid() = follower_id);

-- Policy: Allow users to unfollow
create policy "Allow users to unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);
