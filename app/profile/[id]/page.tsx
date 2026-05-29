'use client'

import React, { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Grid, 
  Bookmark, 
  Tag, 
  MoreHorizontal, 
  User,
  Settings,
  Heart,
  MessageCircle
} from 'lucide-react'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import Link from 'next/link'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  
  const supabase = createBrowserSupabase()
  const router = useRouter()

  useEffect(() => {
    async function fetchProfileData() {
      setLoading(true)
      
      // Get Current User
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      // Get Target Profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', params.id)
        .single()

      if (profileError || !profileData) {
        console.error('Profile not found')
        setLoading(false)
        return
      }
      setProfile(profileData)

      // Get Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', params.id)
        .order('created_at', { ascending: false })
      
      setPosts(postsData || [])

      // Get Counts
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', params.id)
      setFollowerCount(followers || 0)

      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', params.id)
      setFollowingCount(following || 0)

      // Check if following
      if (session?.user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', session.user.id)
          .eq('following_id', params.id)
          .maybeSingle()
        
        setIsFollowing(!!followData)
      }

      setLoading(false)
    }

    fetchProfileData()

    // Realtime subscription for follower count and status
    const profileSubscription = supabase
      .channel(`profile_${params.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${params.id}`
      }, async () => {
        // Refresh follower count
        const { count: followers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', params.id)
        setFollowerCount(followers || 0)

        // Refresh following count
        const { count: following } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', params.id)
        setFollowingCount(following || 0)

        // Refresh isFollowing if it's the current user's action
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', session.user.id)
            .eq('following_id', params.id)
            .maybeSingle()
          setIsFollowing(!!followData)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(profileSubscription)
    }
  }, [params.id, supabase])

  const handleFollow = async () => {
    if (!user || user.id === params.id) {
      if (!user) router.push('/signin')
      return
    }
    
    const prevIsFollowing = isFollowing
    const prevFollowerCount = followerCount
    
    // Optimistic Update
    setIsFollowing(!isFollowing)
    setFollowerCount(prevFollowerCount + (isFollowing ? -1 : 1))
    
    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', params.id)
      
      if (error) {
        setIsFollowing(prevIsFollowing)
        setFollowerCount(prevFollowerCount)
        console.error('Error unfollowing:', error.message)
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: params.id
        })
      
      if (error) {
        setIsFollowing(prevIsFollowing)
        setFollowerCount(prevFollowerCount)
        console.error('Error following:', error.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-instagram"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="text-slate-500 mb-6">The link you followed may be broken, or the account may have been removed.</p>
        <button onClick={() => router.push('/')} className="bg-instagram text-white px-6 py-2 rounded-xl font-bold">
          Go back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-3 border-b border-slate-100">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-1">
          <h1 className="font-bold text-slate-900">{profile.username}</h1>
          {profile.is_verified && <VerifiedBadge className="h-4 w-4" />}
        </div>
        <button className="p-2 hover:bg-slate-50 rounded-full transition">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Profile Info Section */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-16 mb-12">
          <div className="relative group">
            <div className="h-24 w-24 sm:h-40 sm:w-40 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-1 shadow-xl">
              <div className="h-full w-full rounded-full bg-white p-1">
                <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
                  ) : (
                    <User size={64} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-2xl font-light text-slate-900 flex items-center justify-center sm:justify-start">
                {profile.username}
                {profile.is_verified && <VerifiedBadge className="h-6 w-6 ml-2" />}
              </h2>
              <div className="flex gap-2 justify-center sm:justify-start">
                {user?.id === profile.id ? (
                  <>
                    <button className="px-6 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition" onClick={() => router.push('/?tab=profile&edit=true')}>
                      Edit Profile
                    </button>
                    <button className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition" onClick={() => router.push('/?tab=settings')}>
                      <Settings size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleFollow}
                      className={`px-8 py-1.5 rounded-lg text-sm font-semibold transition ${
                        isFollowing 
                          ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' 
                          : 'bg-instagram text-white hover:bg-blue-600'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="px-6 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition">
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-around sm:justify-start sm:gap-10 text-base">
              <p><span className="font-bold">{posts.length}</span> posts</p>
              <p><span className="font-bold">{followerCount}</span> followers</p>
              <p><span className="font-bold">{followingCount}</span> following</p>
            </div>
            
            <div className="text-sm">
              <p className="font-bold">{profile.full_name}</p>
              <p className="text-slate-600 whitespace-pre-wrap">Official RiseGO Profile • Digital Creator</p>
              <a href="#" className="text-blue-900 font-semibold block mt-1 hover:underline">rise.go/{profile.username}</a>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center border-t border-slate-100">
          <div className="flex gap-12 sm:gap-16">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-4 border-t-2 transition-all ${
                activeTab === 'posts' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'
              }`}
            >
              <Grid size={12} className="uppercase font-bold tracking-widest" />
              <span className="text-[10px] font-black uppercase tracking-widest">Posts</span>
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-4 border-t-2 transition-all ${
                activeTab === 'saved' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'
              }`}
            >
              <Bookmark size={12} className="uppercase font-bold tracking-widest" />
              <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
            </button>
            <button 
              onClick={() => setActiveTab('tagged')}
              className={`flex items-center gap-2 py-4 border-t-2 transition-all ${
                activeTab === 'tagged' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'
              }`}
            >
              <Tag size={12} className="uppercase font-bold tracking-widest" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tagged</span>
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-1 sm:gap-8 mt-1">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div 
                key={post.id} 
                className="aspect-square bg-slate-100 relative group overflow-hidden cursor-pointer sm:rounded-xl"
              >
                {post.image_url ? (
                  <img src={post.image_url} alt="Post" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    <Grid size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-6 text-white font-bold">
                  <div className="flex items-center gap-2">
                    <Heart size={20} fill="white" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={20} fill="white" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300">
                <Grid size={40} />
              </div>
              <h3 className="text-xl font-bold">No Posts Yet</h3>
              <p className="text-slate-500">When {profile.username} shares photos, they will appear here.</p>
            </div>
          )}
        </div>
      </main>

      {/* Navigation Footer (Mobile) */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center justify-around p-4 sm:hidden">
        <Link href="/">
          <ArrowLeft size={24} className="text-slate-900" />
        </Link>
      </footer>
    </div>
  )
}
