import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Database } from '@/types/supabase'

type Props = {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createServerSupabase()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username, full_name, avatar_url, is_verified')
    .eq('id', params.id)
    .single()

  if (userError || !user) {
    return notFound()
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('id, caption, image_url, likes, comments, created_at')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', params.id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', params.id)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-500">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Profile</p>
            <h1 className="text-2xl font-semibold text-slate-900">{user.full_name}</h1>
            <p className="text-sm text-slate-600">@{user.username}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Followers</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{followerCount ?? 0}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Following</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{followingCount ?? 0}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Verified</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{user.is_verified ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Posts</h2>
          <span className="text-sm text-slate-500">{posts?.length ?? 0} total</span>
        </div>

        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: Database['public']['Tables']['posts']['Row']) => (
              <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.caption || 'Post image'} className="mb-4 h-72 w-full rounded-2xl object-cover" />
                ) : null}
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">{post.caption || 'No caption'}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            This user has not posted yet.
          </div>
        )}
      </section>
    </main>
  )
}
