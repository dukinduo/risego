'use client'

import { useState } from 'react'
import { CheckCircle2, ShieldAlert, ShieldClose, Trash2, UserCheck } from 'lucide-react'
import type { Database } from '@/types/supabase'

export type UserRow = Database['public']['Tables']['users']['Row']

interface AdminUserTableProps {
  initialUsers: UserRow[]
}

const actionLabels: Record<string, string> = {
  verify: 'Verify',
  unverify: 'Unverify',
  ban: 'Ban',
  unban: 'Unban',
  terminate: 'Terminate',
}

export function AdminUserTable({ initialUsers }: AdminUserTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [savingId, setSavingId] = useState<string | null>(null)

  const updateRow = async (userId: string, action: string) => {
    setSavingId(userId)
    const response = await fetch('/api/admin/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    })

    if (!response.ok) {
      setSavingId(null)
      return
    }

    const result = await response.json()
    setUsers((current) =>
      current.map((item) => (item.id === result.id ? { ...item, ...result } : item)),
    )
    setSavingId(null)
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="grid gap-4 p-5 sm:p-6">
        <div className="text-sm text-slate-500">Total users: {users.length}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                        {user.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.full_name}{' '}
                          {user.is_verified ? (
                            <CheckCircle2 className="inline h-4 w-4 text-instagram" />
                          ) : null}
                        </p>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700 capitalize">{user.status}</td>
                  <td className="px-4 py-4 text-slate-700">{user.role}</td>
                  <td className="px-4 py-4 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={savingId === user.id}
                        type="button"
                        onClick={() => updateRow(user.id, user.is_verified ? 'unverify' : 'verify')}
                        className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        <UserCheck className="h-4 w-4" />
                        {actionLabels[user.is_verified ? 'unverify' : 'verify']}
                      </button>
                      {user.status !== 'banned' && user.status !== 'terminated' ? (
                        <button
                          disabled={savingId === user.id}
                          type="button"
                          onClick={() => updateRow(user.id, 'ban')}
                          className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                        >
                          <ShieldAlert className="h-4 w-4" /> Ban
                        </button>
                      ) : null}
                      {user.status === 'banned' ? (
                        <button
                          disabled={savingId === user.id}
                          type="button"
                          onClick={() => updateRow(user.id, 'unban')}
                          className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                        >
                          <ShieldClose className="h-4 w-4" /> Unban
                        </button>
                      ) : null}
                      <button
                        disabled={savingId === user.id}
                        type="button"
                        onClick={() => updateRow(user.id, 'terminate')}
                        className="inline-flex items-center gap-1 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" /> Terminate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
        Verified users are shown with a blue checkmark. Terminated accounts are permanently locked.
      </div>
    </div>
  )
}
