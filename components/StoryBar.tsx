import React from 'react'
import { Plus } from 'lucide-react'

interface StoryBarProps {
  users: any[]
  currentUser: any
}

export function StoryBar({ users, currentUser }: StoryBarProps) {
  // Mock some stories if none exist
  const storyUsers = users.slice(0, 8)

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
      {/* Current User Story */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
        <div className="relative">
          <div className="h-16 w-16 rounded-full p-[2px] border border-slate-200 bg-white">
            <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
              {currentUser?.profile?.avatar_url ? (
                <img src={currentUser.profile.avatar_url} alt="You" className="h-full w-full object-cover" />
              ) : (
                currentUser?.profile?.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-instagram text-white rounded-full border-2 border-white p-0.5">
            <Plus size={12} strokeWidth={4} />
          </div>
        </div>
        <span className="text-[10px] font-medium text-slate-500">Your Story</span>
      </div>

      {/* Other Users Stories */}
      {storyUsers.map((user, i) => (
        <div key={user.id || i} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
          <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 animate-in fade-in zoom-in duration-500">
            <div className="h-full w-full rounded-full bg-white p-[2px]">
              <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-50">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover group-hover:scale-110 transition duration-300" />
                ) : (
                  user.username?.[0]?.toUpperCase() || '?'
                )}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-700 max-w-[64px] truncate">
            {user.username}
          </span>
        </div>
      ))}
    </div>
  )
}
