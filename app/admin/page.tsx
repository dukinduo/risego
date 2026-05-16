import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { AdminUserTable } from '@/components/AdminUserTable'
import type { Database } from '@/types/supabase'

export default async function AdminPage() {
  const supabase = createServerSupabase()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signin')
  }

  const { data: currentUserData, error: currentError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const currentUser = currentUserData as { role: Database['public']['Tables']['users']['Row']['role'] } | null

  if (currentError) {
    return (
      <main className="min-h-screen bg-surface px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-instagram">Admin dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Database configuration required</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The app could not load the `public.users` table. Please create the required table in Supabase using the SQL provided in `scripts/create_users_table.sql`.
            </p>
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {currentError.message}
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (currentUser?.role !== 'admin') {
    redirect('/signin')
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id,email,username,full_name,avatar_url,status,is_verified,role,created_at')
    .order('created_at', { ascending: false })

  if (error || !users) {
    return (
      <main className="min-h-screen bg-surface px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-instagram">Admin dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Database error</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              There was a problem loading the admin user list.
            </p>
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {error?.message ?? 'Unknown error'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-instagram">Admin dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">User moderation</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manage account verification, ban state, and termination from a responsive table.
              </p>
            </div>
          </div>
        </div>

        <AdminUserTable initialUsers={users} />
      </div>
    </main>
  )
}
