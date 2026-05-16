import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function HomePage() {
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
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/signin" className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/signup" className="flex items-center justify-center rounded-2xl bg-instagram px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                Create Account
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Admin dashboard</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Only users with the <span className="font-semibold">admin</span> role can access <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">/admin</code>.
          </p>
        </section>
      </div>
    </main>
  )
}
