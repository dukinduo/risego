'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Grid,
  Bookmark,
  Tag,
  ArrowRight,
  Menu,
  MessageCircle,
  Share2,
  MoreHorizontal,
  X,
  Camera
} from 'lucide-react'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { VerifiedBadge } from '@/components/VerifiedBadge'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('feed')
  const [adminCode, setAdminCode] = useState('')
  const [adminMessage, setAdminCodeMessage] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editFullName, setEditFullName] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const supabase = createBrowserSupabase()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      // Get User
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser({ ...session.user, profile })
      }

      // Get Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (postsData) {
        setPosts(postsData)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10)

    if (data) {
      setSearchResults(data)
    }
    setIsSearching(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    if (!editUsername || !editFullName) return
    setIsSavingProfile(true)

    const { error } = await supabase
      .from('users')
      .update({
        username: editUsername,
        full_name: editFullName,
        avatar_url: editAvatarUrl
      })
      .eq('id', user.id)

    if (error) {
      alert(`Error updating profile: ${error.message}`)
    } else {
      // Also update posts if username changed
      if (editUsername !== user.profile?.username) {
        await supabase
          .from('posts')
          .update({ username: editUsername, full_name: editFullName })
          .eq('user_id', user.id)
      }

      setUser({ 
        ...user, 
        profile: { 
          ...user.profile, 
          username: editUsername, 
          full_name: editFullName,
          avatar_url: editAvatarUrl
        } 
      })
      setIsEditProfileOpen(false)
      alert('Profile updated successfully!')
    }
    setIsSavingProfile(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }
    setIsChangingPassword(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      alert(`Error changing password: ${error.message}`)
    } else {
      alert('Password changed successfully!')
      setIsChangePasswordOpen(false)
      setNewPassword('')
    }
    setIsChangingPassword(false)
  }

  const handlePost = async () => {
    if (!caption && !selectedImage) return
    setIsPosting(true)
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        username: user.profile?.username,
        full_name: user.profile?.full_name,
        is_verified: user.profile?.is_verified,
        caption: caption,
        image_url: selectedImage, // In a real app, you'd upload this to Supabase Storage first
      })
      .select()
      .single()

    if (error) {
      alert(`Error posting: ${error.message}`)
    } else {
      setPosts([data, ...posts])
      setCaption('')
      setSelectedImage(null)
      setActiveTab('feed')
    }
    setIsPosting(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

  const handleAdminCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adminCode === '123456') { // This is your secret code
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id)
      
      if (error) {
        setAdminCodeMessage(`Error: ${error.message}`)
      } else {
        setAdminCodeMessage('Success! You are now an admin. Refreshing...')
        setTimeout(() => window.location.reload(), 1500)
      }
    } else {
      setAdminCodeMessage('Invalid code. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-instagram"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col gap-8 pb-12 pt-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 text-center">
            <img src="/logo.png" alt="RiseGO" className="h-16 w-auto mx-auto mb-6" />
            <p className="text-slate-600 mb-8 text-lg">Join the mobile-first social experience.</p>
            <div className="grid gap-3 sm:grid-cols-2 max-w-xs mx-auto">
              <Link href="/signin" className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                Sign In
              </Link>
              <Link href="/signup" className="flex items-center justify-center rounded-2xl bg-instagram px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                Create Account
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20 pt-4 sm:pb-0 sm:pt-0 sm:pl-20 md:pl-64">
      {/* Sidebar Navigation (Desktop) */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full border-t border-slate-100 bg-white px-4 py-3 sm:top-0 sm:h-screen sm:w-20 sm:flex-col sm:border-r sm:border-t-0 sm:py-8 md:w-64 md:px-6">
        <div className="hidden items-center gap-3 mb-12 sm:flex md:px-2">
          <img src="/logo.png" alt="RiseGO" className="h-10 w-auto md:block hidden" />
          <div className="h-8 w-8 rounded-lg bg-instagram sm:block md:hidden overflow-hidden">
            <img src="/icon.png" alt="RiseGO" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="flex w-full items-center justify-around sm:flex-col sm:items-stretch sm:gap-2">
          <NavButton icon={<Home />} label="Home" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
          <NavButton icon={<Search />} label="Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
          <NavButton icon={<PlusSquare />} label="Create" active={activeTab === 'create'} onClick={() => setActiveTab('create')} />
          <NavButton icon={<Heart />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
          <NavButton icon={<User />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavButton icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          
          <div className="mt-auto hidden sm:block space-y-2">
            <NavButton 
              icon={<Menu />} 
              label="More" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-8">
        {activeTab === 'feed' && (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-2">
                  <PlusSquare size={32} className="text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">No Posts Yet</h2>
                <p className="text-slate-500 max-w-xs">When people you follow share photos, they will appear here in your feed.</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="text-instagram font-bold text-sm hover:text-blue-600 transition"
                >
                  Share your first photo
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold">Create New Post</h2>
              <button 
                onClick={handlePost}
                disabled={isPosting || (!caption && !selectedImage)}
                className="text-instagram font-bold text-sm disabled:opacity-50"
              >
                {isPosting ? 'Sharing...' : 'Share'}
              </button>
            </div>
            
            <div 
              onClick={() => document.getElementById('fileInput')?.click()}
              className={`aspect-square w-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center space-y-4 transition cursor-pointer group relative overflow-hidden ${
                selectedImage ? 'border-transparent bg-slate-900' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {selectedImage ? (
                <>
                  <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <p className="text-white font-bold text-sm">Change Photo</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-white shadow-soft flex items-center justify-center group-hover:scale-110 transition">
                    <PlusSquare size={32} className="text-instagram" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900">Select photos (optional)</p>
                    <p className="text-xs text-slate-500 mt-1">Drag and drop files here</p>
                  </div>
                  <button className="bg-instagram text-white px-4 py-2 rounded-xl text-xs font-bold shadow-instagram/20 shadow-lg pointer-events-none">
                    Select from computer
                  </button>
                </>
              )}
              <input 
                id="fileInput"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageSelect}
              />
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Caption</span>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..." 
                  className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:border-instagram h-32 resize-none"
                />
              </label>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition">
                <span className="text-sm font-medium">Add Location</span>
                <PlusSquare size={20} className="text-slate-400" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition">
                <span className="text-sm font-medium">Advanced Settings</span>
                <ArrowRight size={20} className="text-slate-400" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-slate-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-instagram/20 transition"
              />
            </div>

            {searchQuery.length >= 2 ? (
              <div className="space-y-4">
                {isSearching ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-instagram"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div key={result.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-50">
                        {result.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-slate-900">@{result.username}</span>
                          {result.is_verified && <VerifiedBadge className="h-4 w-4" />}
                        </div>
                        <p className="text-xs text-slate-500">{result.full_name}</p>
                      </div>
                      <button className="bg-instagram text-white px-4 py-1.5 rounded-lg text-xs font-bold">Follow</button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <p className="text-slate-500">No results found for &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold">Search for content</h3>
                <p className="text-slate-500">Explore and find interesting people and posts.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-8">Notifications</h2>
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-16 w-16 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold">Activity On Your Posts</h3>
              <p className="text-slate-500">When someone likes or comments on one of your posts, you&apos;ll see it here.</p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 pb-8 border-b border-slate-100">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 ring-4 ring-slate-50 overflow-hidden">
                {user.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
              <div className="flex-1 space-y-4 text-center sm:text-left w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h2 className="text-xl font-semibold flex items-center justify-center sm:justify-start">
                    @{user.profile?.username}
                    {user.profile?.is_verified && <VerifiedBadge className="h-5 w-5 ml-2" />}
                  </h2>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <button 
                      onClick={() => {
                        setEditUsername(user.profile?.username || '')
                        setEditFullName(user.profile?.full_name || '')
                        setEditAvatarUrl(user.profile?.avatar_url || null)
                        setIsEditProfileOpen(true)
                      }}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold"
                    >
                      Edit Profile
                    </button>
                    <button className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg" onClick={() => setActiveTab('settings')}>
                      <Settings size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-around sm:justify-start sm:gap-10 text-sm">
                  <p><strong>0</strong> posts</p>
                  <p><strong>0</strong> followers</p>
                  <p><strong>0</strong> following</p>
                </div>
                
                <div className="text-sm">
                  <p className="font-bold">{user.profile?.full_name}</p>
                  <p className="text-slate-600">Building the future of social. ✨</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center border-t border-slate-100 -mt-8">
              <div className="flex gap-12 text-xs font-bold tracking-widest uppercase py-4">
                <span className="flex items-center gap-2 border-t-2 border-slate-900 pt-4 -mt-4 cursor-pointer"><Grid size={16} /> Posts</span>
                <span className="flex items-center gap-2 text-slate-400 pt-4 -mt-4 cursor-pointer"><Bookmark size={16} /> Saved</span>
                <span className="flex items-center gap-2 text-slate-400 pt-4 -mt-4 cursor-pointer"><Tag size={16} /> Tagged</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-1 sm:gap-4 pb-12">
              {posts.filter(p => p.user_id === user.id).length > 0 ? (
                posts.filter(p => p.user_id === user.id).map((post) => (
                  <div key={post.id} className="aspect-square bg-slate-100 rounded-lg overflow-hidden group relative cursor-pointer">
                    {post.image_url ? (
                      <img src={post.image_url} alt="Post" className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center p-4 bg-slate-50 text-slate-400 italic text-[10px] text-center">
                        {post.caption.slice(0, 50)}...
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white font-bold text-sm">
                      <span className="flex items-center gap-1"><Heart size={16} fill="white" /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={16} fill="white" /> {post.comments}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center space-y-2 text-slate-400">
                  <PlusSquare size={48} strokeWidth={1} />
                  <p className="text-xl font-bold text-slate-900">No Posts Yet</p>
                  <button onClick={() => setActiveTab('create')} className="text-instagram font-bold text-sm">Share your first photo</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-8">Settings</h2>
            
            <div className="space-y-4">
              <SettingsGroup title="Account">
                <SettingsItem label="Edit Profile" onClick={() => {
                  setEditUsername(user.profile?.username || '')
                  setEditFullName(user.profile?.full_name || '')
                  setEditAvatarUrl(user.profile?.avatar_url || null)
                  setIsEditProfileOpen(true)
                }} />
                <SettingsItem label="Change Password" onClick={() => setIsChangePasswordOpen(true)} />
                <SettingsItem label="Privacy & Security" onClick={() => alert('Your data is secure with RiseGO.')} />
              </SettingsGroup>
              
              <SettingsGroup title="Support">
                <SettingsItem label="Help Center" onClick={() => window.open('https://help.risego.com', '_blank')} />
                <SettingsItem label="Report a Problem" onClick={() => window.location.href = 'mailto:support@risego.com?subject=Report a Problem'} />
                <SettingsItem label="Terms of Service" onClick={() => alert('Terms of Service: Be kind and respectful.')} />
                <SettingsItem label="Email Support" onClick={() => window.location.href = 'mailto:hello@risego.com'} />
              </SettingsGroup>

              {user.profile?.role === 'admin' ? (
                <SettingsGroup title="Admin Controls">
                  <button 
                    onClick={() => router.push('/admin')}
                    className="flex w-full items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-2xl transition"
                  >
                    <span className="text-sm font-semibold text-amber-900">Admin Dashboard</span>
                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                  </button>
                </SettingsGroup>
              ) : (
                <SettingsGroup title="Admin Access">
                  <form onSubmit={handleAdminCodeSubmit} className="p-4 space-y-3">
                    <p className="text-xs text-slate-500 mb-2">Enter secret code to get admin privileges.</p>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        placeholder="Admin Code" 
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-instagram"
                      />
                      <button type="submit" className="bg-slate-900 text-white rounded-xl px-4 py-2 text-sm font-bold hover:bg-slate-800 transition">
                        Verify
                      </button>
                    </div>
                    {adminMessage && (
                      <p className={`text-[10px] font-bold ${adminMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                        {adminMessage}
                      </p>
                    )}
                  </form>
                </SettingsGroup>
              )}

              <button 
                onClick={handleSignOut}
                className="flex w-full items-center justify-center p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition font-bold"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={() => document.getElementById('avatarInput')?.click()}
                  className="relative h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-100 cursor-pointer group overflow-hidden"
                >
                  {editAvatarUrl ? (
                    <img src={editAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">
                      {editUsername[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <input 
                  id="avatarInput"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleProfileImageSelect}
                />
                <button 
                  onClick={() => document.getElementById('avatarInput')?.click()}
                  className="text-instagram text-sm font-bold"
                >
                  Change Profile Photo
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-instagram transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                  <input 
                    type="text" 
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-instagram transition"
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdateProfile}
                disabled={isSavingProfile}
                className="w-full bg-instagram text-white rounded-2xl py-4 font-bold shadow-instagram/20 shadow-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
              <button onClick={() => setIsChangePasswordOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="mt-1 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-instagram transition"
                />
              </div>

              <button 
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold shadow-slate-900/10 shadow-lg hover:bg-slate-800 transition disabled:opacity-50"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavButton({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl p-3 transition sm:px-4 w-full ${
        active 
          ? 'bg-slate-50 text-slate-900' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={`flex-shrink-0 ${active ? 'scale-110 transition' : ''}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </span>
      <span className={`hidden md:block text-sm ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  )
}

function SettingsGroup({ title, children }: any) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">{title}</h3>
      <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SettingsItem({ label, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer text-sm font-medium flex justify-between items-center transition active:bg-slate-100"
    >
      {label}
      <ArrowRight size={16} className="text-slate-300" />
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-soft animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-50">
            {post.username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-900">@{post.username}</span>
              {post.is_verified && <VerifiedBadge className="h-4 w-4" />}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Original audio • 1h</p>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-50 rounded-full transition text-slate-400">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Image */}
      {post.image_url && (
        <div className="aspect-square w-full bg-slate-50 relative overflow-hidden">
          <img src={post.image_url} alt="Post" className="h-full w-full object-cover" />
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-800">
            <button className="hover:text-red-500 transition scale-110 active:scale-125">
              <Heart size={24} />
            </button>
            <button className="hover:text-slate-500 transition">
              <MessageCircle size={24} />
            </button>
            <button className="hover:text-instagram transition">
              <Share2 size={24} />
            </button>
          </div>
          <button className="hover:text-slate-900 transition">
            <Bookmark size={24} />
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-bold text-slate-900">{post.likes.toLocaleString()} likes</p>
          <div className="text-sm">
            <span className="font-bold text-slate-900 mr-2">@{post.username}</span>
            <span className="text-slate-700 leading-relaxed">{post.caption}</span>
          </div>
          <button className="text-sm text-slate-400 font-medium block">
            View all {post.comments} comments
          </button>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold pt-1">
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Comment Input */}
      <div className="px-4 py-3 border-t border-slate-50 flex items-center gap-3">
        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
          U
        </div>
        <input 
          type="text" 
          placeholder="Add a comment..." 
          className="flex-1 text-sm outline-none placeholder:text-slate-300"
        />
        <button className="text-instagram font-bold text-xs disabled:opacity-50">Post</button>
      </div>
    </div>
  )
}
