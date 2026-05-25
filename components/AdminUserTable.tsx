'use client'

import { useState } from 'react'
import { CheckCircle2, ShieldAlert, ShieldClose, Trash2, UserCheck, Shield, ShieldOff, UserCog } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { VerifiedBadge } from './VerifiedBadge'

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
  make_admin: 'Grant Admin',
  remove_admin: 'Revoke Admin',
  change_username: 'Rename'
}

export function AdminUserTable({ initialUsers }: AdminUserTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [savingId, setSavingId] = useState<string | null>(null)

  const updateRow = async (userId: string, action: string, extraData: any = {}) => {
    setSavingId(userId)
    const response = await fetch('/api/admin/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, ...extraData }),
    })

    if (!response.ok) {
      const err = await response.json()
      alert(`Error: ${err.error || 'Failed to update user'}`)
      setSavingId(null)
      return
    }

    const result = await response.json()
    setUsers((current) =>
      current.map((item) => (item.id === result.id ? { ...item, ...result } : item)),
    )
    setSavingId(null)
  }

  const handleChangeUsername = (userId: string, currentUsername: string) => {
    const newUsername = window.prompt('Enter new username:', currentUsername)
    if (newUsername && newUsername !== currentUsername) {
      updateRow(userId, 'change_username', { newUsername })
    }
  }

  const handleChangeEmail = (userId: string, currentEmail: string) => {
    const newEmail = window.prompt('Enter new email:', currentEmail)
    if (newEmail && newEmail !== currentEmail) {
      updateRow(userId, 'change_email', { newEmail })
    }
  }

  const handleChangePassword = (userId: string) => {
    const newPassword = window.prompt('Enter new password (min 6 chars):', '')
    if (newPassword && newPassword.length >= 6) {
      updateRow(userId, 'change_password', { newPassword })
    } else if (newPassword) {
      alert('Password must be at least 6 characters.')
    }
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
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          user.full_name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.full_name}{' '}
                          {user.is_verified ? (
                            <VerifiedBadge />
                          ) : null}
                        </p>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700 capitalize">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        {user.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      user.role === 'admin' 
                        ? 'bg-amber-50 text-amber-700 ring-amber-600/20' 
                        : 'bg-slate-50 text-slate-600 ring-slate-600/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={savingId === user.id}
                        type="button"
                        onClick={() => updateRow(user.id, user.is_verified ? 'unverify' : 'verify')}
                        className={`inline-flex items-center gap-1 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                          user.is_verified 
                            ? 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <UserCheck className="h-4 w-4" />
                        {actionLabels[user.is_verified ? 'unverify' : 'verify']}
                      </button>

                      <button
                        disabled={savingId === user.id}
                        type="button"
                        onClick={() => updateRow(user.id, user.role === 'admin' ? 'remove_admin' : 'make_admin')}
                        className={`inline-flex items-center gap-1 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                          user.role === 'admin' 
                            ? 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {user.role === 'admin' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        {actionLabels[user.role === 'admin' ? 'remove_admin' : 'make_admin']}
                      </button>

                      <button
                        disabled={savingId === user.id}
                        type="button"
                        onClick={() => handleChangeUsername(user.id, user.username)}
                        className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        <UserCog className="h-4 w-4" />
                        Rename
                      </button>

                      <button
                        disabled={savingId === user.id}
                        type="button"
                        onClick={() => handleChangeEmail(user.id, user.email)}
                        className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        <UserCog className="h-4 w-4" />
                        Change Email
                      </button>

                      <button
                        disabled={savingId === user.id}
                        type="button"
                        onClick={() => handleChangePassword(user.id)}
                        className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        <UserCog className="h-4 w-4" />
                        Change Password
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
