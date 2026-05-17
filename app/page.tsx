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
  Menu
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
  const supabase = createBrowserSupabase()
  const router = useRouter()

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

  const handlePost = async () => {
    if (!caption && !selectedImage) return
    setIsPosting(true)
    // Mocking the post success
    setTimeout(() => {
      setIsPosting(false)
      setCaption('')
      setSelectedImage(null)
      setActiveTab('feed')
      alert('Post shared successfully!')
    }, 1500)
  }

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
           console.error('Error fetching profile:', error)
        }
        setUser({ ...session.user, profile })
      }
      setLoading(false)
    }
    getUser()
  }, [])

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
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">RiseGO</h1>
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
          <span className="text-2xl font-bold tracking-tighter text-slate-900 md:block hidden">RiseGO</span>
          <div className="h-8 w-8 rounded-lg bg-instagram sm:block md:hidden"></div>
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-700">
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
                className="w-full bg-slate-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-instagram/20 transition"
              />
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-16 w-16 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold">Search for content</h3>
              <p className="text-slate-500">Explore and find interesting people and posts.</p>
            </div>
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
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 ring-4 ring-slate-50">
                <User size={64} />
              </div>
              <div className="flex-1 space-y-4 text-center sm:text-left w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h2 className="text-xl font-semibold flex items-center justify-center sm:justify-start">
                    @{user.profile?.username}
                    {user.profile?.is_verified && <VerifiedBadge className="h-5 w-5 ml-2" />}
                  </h2>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <button className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold">Edit Profile</button>
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
                <span className="flex items-center gap-2 border-t-2 border-slate-900 pt-4 -mt-4"><Grid size={16} /> Posts</span>
                <span className="flex items-center gap-2 text-slate-400 pt-4 -mt-4"><Bookmark size={16} /> Saved</span>
                <span className="flex items-center gap-2 text-slate-400 pt-4 -mt-4"><Tag size={16} /> Tagged</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 text-slate-400">
               <PlusSquare size={48} strokeWidth={1} />
               <p className="text-xl font-bold text-slate-900">No Posts Yet</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-8">Settings</h2>
            
            <div className="space-y-4">
              <SettingsGroup title="Account">
                <SettingsItem label="Edit Profile" />
                <SettingsItem label="Change Password" />
                <SettingsItem label="Privacy & Security" />
              </SettingsGroup>
              
              <SettingsGroup title="Support">
                <SettingsItem label="Help Center" />
                <SettingsItem label="Report a Problem" />
                <SettingsItem label="Terms of Service" />
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

function SettingsItem({ label }: any) {
  return (
    <div className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer text-sm font-medium flex justify-between items-center">
      {label}
      <ArrowRight size={16} className="text-slate-300" />
    </div>
  )
}
