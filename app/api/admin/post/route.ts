import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const createServiceClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

  if (currentError || currentUserData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { postId } = body as { postId?: string }

  if (!postId) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
  }

  const adminClient = createServiceClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 501 })
  }

  const { error } = await adminClient
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
