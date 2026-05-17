'use client'

import { useState, useEffect } from 'react'
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
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    async function checkDb() {
      const supabase = createBrowserSupabase()
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!anonKey) {
        setDbError('Configuration error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please check your .env.local file.')
        return
      }

      if (anonKey.startsWith('sb_') || anonKey.startsWith('pk_')) {
        setDbError(`CRITICAL CONFIG ERROR: Your key starts with "${anonKey.substring(0, 15)}...". This is a Stripe key, not a Supabase key. Update it in your .env.local and Vercel dashboard.`)
        return
      }

      const { error } = await supabase.from('users').select('id').limit(1)
      if (error) {
        if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
          setDbError('Database setup required: The `public.users` table does not exist.')
        } else if (error.message.includes('JWT') || error.message.includes('Invalid API key') || error.message.includes('apiKey header')) {
          setDbError('Configuration error: The Supabase API key is invalid or missing. Please check your .env.local file.')
        }
      }
    }
    checkDb()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (anonKey?.startsWith('sb_') || anonKey?.startsWith('pk_')) {
      setMessage(`CRITICAL ERROR: Using Stripe key "${anonKey.substring(0, 15)}...". Replace it with Supabase Anon Key in .env.local/Vercel.`)
      setLoading(false)
      return
    }

    const supabase = createBrowserSupabase()

    let email = identifier
    if (!identifier.includes('@')) {
      const { data: userDataRaw, error: userError } = await supabase
        .from('users')
        .select('email, status')
        .eq('username', identifier)
        .single()

      const userData = userDataRaw as { email: string; status: Database['public']['Tables']['users']['Row']['status'] } | null

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
      if (error?.message.includes('Invalid API key')) {
        setMessage('Configuration error: The Supabase API key is invalid. (It looks like a Stripe key is being used in .env.local)')
      } else {
        setMessage(error?.message ?? 'Unable to sign in. Please check your credentials.')
      }
      setLoading(false)
      return
    }

    const { data: profileDataRaw, error: profileError } = await supabase
      .from('users')
      .select('status')
      .eq('id', data.user.id)
      .single()

    const profileData = profileDataRaw as { status: Database['public']['Tables']['users']['Row']['status'] } | null

    if (profileError || !profileData) {
      // If the user exists in auth.users but not in public.users, attempt to sync it now
      // This can happen if the signup process was interrupted or the users table was created later
      const { error: syncError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata.username || data.user.email!.split('@')[0],
          full_name: data.user.user_metadata.full_name || 'User',
          status: 'active',
          is_verified: true,
          role: 'user',
        })

      if (syncError) {
        setMessage('Unable to validate account status. Please contact support.')
        setLoading(false)
        return
      }
    } else {
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
            {dbError && (
              <div className="rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 border border-amber-200">
                <p className="font-bold">Setup Required</p>
                <p className="mt-1">{dbError}</p>
              </div>
            )}
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
