import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Database } from '@/types/supabase'

export async function GET() {
  const supabase = createServerSupabase()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: currentUser, error: currentError } = await supabase
    .from<Database['public']['Tables']['users']>('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (currentError || currentUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from<Database['public']['Tables']['users']>('users')
    .select('id,email,username,full_name,avatar_url,status,is_verified,role,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
