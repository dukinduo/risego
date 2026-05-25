import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const createServiceClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }) as any
}

export async function POST(request: Request) {
  const body = await request.json()
  const { postId, action } = body as { postId?: string; action?: 'like' | 'unlike' }
  if (!postId || !action) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const admin = createServiceClient()
  if (!admin) return NextResponse.json({ error: 'Service role key not configured' }, { status: 501 })

  try {
    const { data: postRow, error: selErr } = await admin.from('posts').select('likes').eq('id', postId).single()
    if (selErr || !postRow) return NextResponse.json({ error: selErr?.message || 'Post not found' }, { status: 404 })

    const current = postRow.likes || 0
    const delta = action === 'like' ? 1 : -1
    const newLikes = Math.max(0, current + delta)

    const { data, error } = await admin.from('posts').update({ likes: newLikes }).eq('id', postId).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, likes: data.likes })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
