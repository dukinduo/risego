-- Run this SQL in the Supabase SQL editor to create the required users table.
create table if not exists public.users (
  id uuid primary key references auth.users(id),
  email text not null unique,
  username text not null unique,
  full_name text not null,
  avatar_url text,
  status text not null default 'active',
  is_verified boolean not null default false,
  role text not null default 'user',
  created_at timestamp with time zone not null default now()
);
