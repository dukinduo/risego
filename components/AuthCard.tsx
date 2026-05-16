import { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:px-8 sm:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
    </div>
  )
}
