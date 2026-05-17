'use client'

import { useEffect, useState } from 'react'
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
  ArrowRight
} from 'lucide-react'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { VerifiedBadge } from '@/components/VerifiedBadge'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('feed')
  const supabase = createBrowserSupabase()
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
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
          <NavButton icon={<PlusSquare />} label="Create" />
          <NavButton icon={<Heart />} label="Notifications" />
          <NavButton icon={<User />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavButton icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          
          <div className="mt-auto hidden sm:block">
            {user.profile?.role === 'admin' && (
              <NavButton 
                icon={<ShieldCheck className="text-amber-500" />} 
                label="Admin" 
                onClick={() => router.push('/admin')} 
              />
            )}
            <NavButton icon={<LogOut />} label="Sign Out" onClick={handleSignOut} />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-8">
        {activeTab === 'feed' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold sm:hidden">RiseGO</h2>
            {/* Feed Items (Placeholders) */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold flex items-center">
                      User_{i} {i === 1 && <VerifiedBadge />}
                    </p>
                    <p className="text-xs text-slate-500">Suggested for you</p>
                  </div>
                </div>
                <div className="aspect-square bg-slate-50 flex items-center justify-center text-slate-300">
                   <PlusSquare size={48} strokeWidth={1} />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex gap-4">
                    <Heart className="hover:text-red-500 cursor-pointer" />
                    <Search className="rotate-90 hover:text-instagram cursor-pointer" />
                    <PlusSquare className="hover:text-instagram cursor-pointer" />
                  </div>
                  <p className="text-sm font-bold">1,234 likes</p>
                  <p className="text-sm">
                    <span className="font-bold mr-2">User_{i}</span>
                    This is a beautiful mobile-first social experience! #RiseGO #Social
                  </p>
                </div>
              </div>
            ))}
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
                    <button className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg">
                      <Settings size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-around sm:justify-start sm:gap-10 text-sm">
                  <p><strong>42</strong> posts</p>
                  <p><strong>12.5k</strong> followers</p>
                  <p><strong>890</strong> following</p>
                </div>
                
                <div className="text-sm">
                  <p className="font-bold">{user.profile?.full_name}</p>
                  <p className="text-slate-600">Mobile-first developer. Building the future of social. ✨</p>
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
            
            <div className="grid grid-cols-3 gap-1 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center text-slate-200 hover:bg-slate-100 transition cursor-pointer">
                  <PlusSquare size={32} strokeWidth={1} />
                </div>
              ))}
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

              {user.profile?.role === 'admin' && (
                <SettingsGroup title="Admin Controls">
                  <button 
                    onClick={() => router.push('/admin')}
                    className="flex w-full items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-2xl transition"
                  >
                    <span className="text-sm font-semibold text-amber-900">Admin Dashboard</span>
                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                  </button>
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
      className={`flex items-center gap-4 rounded-2xl p-3 transition sm:px-4 ${
        active 
          ? 'bg-slate-50 text-slate-900' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={active ? 'scale-110 transition' : ''}>{icon}</span>
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
