import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const createServiceClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Don't throw at module load — return null so handlers can respond with 501
    return null
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  }) as any
}

export async function POST(request: Request) {
  const supabase = createServerSupabase()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: currentUserData, error: currentError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const currentUser = currentUserData as { role: Database['public']['Tables']['users']['Row']['role'] } | null

  if (currentError || currentUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, action, newUsername } = body as { userId: string; action: string; newUsername?: string }

  const updates: Partial<Database['public']['Tables']['users']['Update']> = {}
  switch (action) {
    case 'change_username':
      if (!newUsername) return NextResponse.json({ error: 'New username is required' }, { status: 400 })
      updates.username = newUsername
      break
    case 'verify':
      updates.is_verified = true
      break
    case 'unverify':
      updates.is_verified = false
      break
    case 'ban':
      updates.status = 'banned'
      break
    case 'unban':
      updates.status = 'active'
      break
    case 'terminate':
      updates.status = 'terminated'
      break
    case 'make_admin':
      updates.role = 'admin'
      break
    case 'remove_admin':
      updates.role = 'user'
      break
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const adminClient = createServiceClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 501 })
  }

  const { data, error } = await adminClient
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id,email,username,full_name,avatar_url,status,is_verified,role,created_at')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If username was changed, update posts table as well
  if (action === 'change_username' && newUsername) {
    await adminClient
      .from('posts')
      .update({ username: newUsername })
      .eq('user_id', userId)
  }

  return NextResponse.json(data)
}
