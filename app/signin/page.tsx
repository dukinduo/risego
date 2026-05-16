'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { AuthCard } from '@/components/AuthCard'
import type { Database } from '@/types/supabase'

export default function SignInPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    const supabase = createBrowserSupabase()

    let email = identifier
    if (!identifier.includes('@')) {
      const { data: userData, error: userError } = await supabase
        .from<Database['public']['Tables']['users']>('users')
        .select('email, status')
        .eq('username', identifier)
        .single()

      if (userError || !userData) {
        setMessage('No account found for that username or email.')
        setLoading(false)
        return
      }

      if (userData.status === 'banned') {
        setMessage('Your account is banned. Contact support if you think this is an error.')
        setLoading(false)
        return
      }

      if (userData.status === 'terminated') {
        setMessage('Your account has been terminated and cannot be accessed.')
        setLoading(false)
        return
      }

      email = userData.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      setMessage(error?.message ?? 'Unable to sign in. Please check your credentials.')
      setLoading(false)
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from<Database['public']['Tables']['users']>('users')
      .select('status')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profileData) {
      setMessage('Unable to validate account status.')
      setLoading(false)
      return
    }

    if (profileData.status === 'banned') {
      await supabase.auth.signOut()
      setMessage('Your account is banned. Access denied.')
      setLoading(false)
      return
    }

    if (profileData.status === 'terminated') {
      await supabase.auth.signOut()
      setMessage('Your account has been terminated. Access denied.')
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-3xl font-semibold text-slate-900">RiseGO</p>
          <p className="mt-2 text-sm text-slate-500">Login to your account with the same clean mobile-first UI.</p>
        </div>
        <AuthCard
          title="Sign in"
          description="Use your username or email and password to access RiseGO."
          footer={
            <p>
              New to RiseGO?{' '}
              <Link className="font-semibold text-instagram hover:text-blue-600" href="/signup">
                Sign up
              </Link>
            </p>
          }
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Username or email
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="username or email"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-instagram focus:ring-4 focus:ring-instagram/10"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-instagram focus:ring-4 focus:ring-instagram/10"
              />
            </label>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <Link href="/signin" className="font-medium text-instagram hover:text-blue-600">
                Forgot password?
              </Link>
            </div>
            {message ? <p className="text-sm text-red-600">{message}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-2xl bg-instagram px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </AuthCard>
      </div>
    </main>
  )
}
