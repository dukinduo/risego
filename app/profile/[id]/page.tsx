import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'
import { VerifiedBadge } from '@/components/VerifiedBadge'

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase()

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single()

  if (userError || !userData) {
    return (
      <main className="min-h-screen bg-white px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <h1 className="text-xl font-bold">Profile not found</h1>
            <p className="text-sm text-slate-600">Could not load the requested profile.</p>
          </div>
        </div>
      </main>
    )
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', params.id)

  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', params.id)

  const followingCount = followingData ? followingData.length : 0

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-slate-100 overflow-hidden">
              {userData.avatar_url ? (
                <img src={userData.avatar_url} alt={userData.username} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-slate-500">{userData.username[0]?.toUpperCase()}</div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">@{userData.username}</h2>
                {userData.is_verified && <VerifiedBadge />}
              </div>
              <p className="text-sm text-slate-600">{userData.full_name}</p>
              <div className="mt-3 text-sm text-slate-700">
                <strong>{posts ? posts.length : 0}</strong> posts • <strong>{followerCount ?? 0}</strong> followers • <strong>{followingCount}</strong> following
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {posts && posts.length > 0 ? (
              posts.map((p: any) => (
                <Link key={p.id} href={`/`} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt="Post" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center p-4 bg-slate-50 text-slate-400 italic text-[10px] text-center">{p.caption?.slice(0,50)}...</div>
                  )}
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400">No posts yet</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
