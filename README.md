# RiseGO

A mobile-first Next.js application with Instagram-inspired authentication and an admin dashboard.

## Features
- Sign Up and Sign In pages with clean centered card layout
- Supabase authentication and data storage
- Admin dashboard at `/admin` for user verification, ban, unban, and termination
- Responsive layout with white background, gray borders, and Instagram blue (#0095f6)

## Required Environment Variables
Create a `.env.local` file at the project root by copying `.env.local.example` and replacing the placeholders:

```bash
cp .env.local.example .env.local
```

Then update `.env.local` with your Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema
Run the following SQL scripts in the Supabase SQL editor to create the required tables and policies.

### 1. Users Table
```sql
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
```

### 2. Posts Table
```sql
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

alter table public.posts enable row level security;

create policy "Allow everyone to read posts" on public.posts for select using (true);
create policy "Allow authenticated users to create posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Allow users to update their own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Allow users to delete their own posts" on public.posts for delete using (auth.uid() = user_id);
```

### 3. Follows Table
```sql
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id),
  following_id uuid not null references auth.users(id),
  created_at timestamp with time zone not null default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Allow everyone to read follows" on public.follows for select using (true);
create policy "Allow authenticated users to follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Allow users to unfollow" on public.follows for delete using (auth.uid() = follower_id);
```

If you see `Could not find the table 'public.X' in the schema cache`, it means that specific table has not been created yet.

## Local Development
1. Install dependencies:

```bash
npm install
```

2. Start the local development server:

```bash
npm run dev
```

3. Open the app at:

```text
http://localhost:3000
```

## Using ngrok
1. Install ngrok by following the official instructions at https://ngrok.com/download.
2. Authenticate ngrok with your account token:

```bash
ngrok authtoken YOUR_NGROK_AUTH_TOKEN
```

3. Expose localhost:3000:

```bash
ngrok http 3000
```

4. Copy the public HTTPS forwarding URL shown by ngrok.

## Supabase Redirect URLs
In Supabase authentication settings, add both URLs:

- `http://localhost:3000`
- `https://YOUR_NGROK_SUBDOMAIN.ngrok.io`

Also add the same URLs under "Redirect URLs" and "Additional Redirect URLs" if required.

## Deployment
The easiest production deployment option is Vercel.

1. Push the repository to GitHub.
2. Sign in to https://vercel.com and import the repository.
3. Set the following environment variables in Vercel:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Deploy the project.

### Production build command
Vercel will automatically use the Next.js builder, but you can also run locally to verify:

```bash
npm run build
npm run start
```

### Production redirect URLs
In Supabase auth settings, add your Vercel domain too:

- `https://your-project.vercel.app`

If you use a custom domain, add that URL as well.

## Notes
- Admin access is restricted to users with `role = 'admin'`.
- Banned users are blocked from signing in.
- Terminated users are permanently locked and their email/username cannot be reused.
