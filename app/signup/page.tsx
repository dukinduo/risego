'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { AuthCard } from '@/components/AuthCard'
import { Database } from '@/types/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    async function checkDb() {
      const supabase = createBrowserSupabase()
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (anonKey?.startsWith('sb_') || anonKey?.startsWith('pk_')) {
        setDbError('CRITICAL CONFIG ERROR: Your NEXT_PUBLIC_SUPABASE_ANON_KEY is a Stripe key. You must replace it with your Supabase Anon Key in .env.local and Vercel Settings.')
        return
      }

      const { error } = await supabase.from('users').select('id').limit(1)
      if (error) {
        if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
          setDbError('Database setup required: The `public.users` table does not exist.')
        } else if (error.message.includes('JWT') || error.message.includes('Invalid API key')) {
          setDbError('Configuration error: The Supabase API key is invalid. Please check your .env.local file.')
        }
      }
    }
    checkDb()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createBrowserSupabase()

    const doSignUp = async () => {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, fullName }),
      })
      return await res.json()
    }

    const data = await doSignUp()

    if (data.error) {
      const msg = data.error
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already exists')) {
        setMessage('This email is already registered. Please try signing in instead.')
      } else {
        setMessage(msg)
      }
      setLoading(false)
      return
    }

    // After successful creation, sign in automatically
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setMessage('Account created, but auto-login failed. Please sign in manually.')
      setLoading(false)
      router.push('/signin')
      return
    }

    setMessage('Account created! Redirecting...')
    setLoading(false)
    router.push('/')
  }

  

  return (
    <main className="min-h-screen bg-surface px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-3xl font-semibold text-slate-900">RiseGO</p>
          <p className="mt-2 text-sm text-slate-500">Create a clean, mobile-first account.</p>
        </div>
        <AuthCard
          title="Sign up"
          description="Use your email, username, and password to join RiseGO."
          footer={
            <p>
              Already on RiseGO?{' '}
              <Link className="font-semibold text-instagram hover:text-blue-600" href="/signin">
                Sign in
              </Link>
            </p>
          }
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            {dbError && (
              <div className="rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 border border-amber-200">
                <p className="font-bold">Setup Required</p>
                <p className="mt-1">{dbError}</p>
              </div>
            )}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-instagram focus:ring-4 focus:ring-instagram/10"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="yourusername"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-instagram focus:ring-4 focus:ring-instagram/10"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Full name"
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
                minLength={6}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-instagram focus:ring-4 focus:ring-instagram/10"
              />
            </label>
            {message ? <p className="text-sm text-red-600">{message}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-2xl bg-instagram px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        </AuthCard>
      </div>
    </main>
  )
}
