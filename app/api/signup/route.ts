import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const createServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase configuration is missing. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env.local file.')
  }

  if (key.startsWith('sb_') || key.startsWith('sk_')) {
    throw new Error('Your SUPABASE_SERVICE_ROLE_KEY looks like a Stripe key. Please use your Supabase Service Role Key.')
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

export async function POST(request: Request) {
  try {
    const { email, password, username, fullName } = await request.json()

    if (!email || !password || !username || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Create user in auth.users with email_confirm: true to bypass rate limits/confirmation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, full_name: fullName },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // 2. Insert into public.users table
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        username,
        full_name: fullName,
        status: 'active',
        is_verified: true,
        role: 'user',
      })

    if (dbError) {
      // If DB insert fails, we should probably delete the auth user to allow retry
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
