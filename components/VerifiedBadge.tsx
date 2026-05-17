'use client'

import { BadgeCheck } from 'lucide-react'

export function VerifiedBadge({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <BadgeCheck className={`${className} text-blue-500 fill-blue-500/10 inline-block ml-1`} />
  )
}
