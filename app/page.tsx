'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, User, LogOut, ShieldCheck } from 'lucide-react'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabase()
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser({ ...session.user, profile })
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-xl flex-col gap-8 pb-12 pt-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm text-slate-500">
            <Sparkles className="h-5 w-5 text-instagram" />
            <span>Mobile-first social feed with clean, Instagram-inspired styling.</span>
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                RiseGO
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
                A clean, responsive authentication experience with an admin user management dashboard.
              </p>
            </div>

            {loading ? (
              <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-instagram text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      @{user.profile?.username || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  {user.profile?.role === 'admin' && (
                    <Link href="/admin" className="rounded-full bg-amber-100 p-2 text-amber-700 hover:bg-amber-200">
                      <ShieldCheck className="h-5 w-5" />
                    </Link>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/signin" className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/signup" className="flex items-center justify-center rounded-2xl bg-instagram px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </section>

        {user?.profile?.role === 'admin' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 border-amber-200 bg-amber-50/30">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              Admin dashboard
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              You have administrator access. Manage users, verification, and status from the dashboard.
            </p>
            <Link href="/admin" className="mt-4 inline-flex items-center text-sm font-semibold text-instagram hover:underline">
              Go to Dashboard
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </section>
        )}

        {!user && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Admin dashboard</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Only users with the <span className="font-semibold">admin</span> role can access <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">/admin</code>.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
