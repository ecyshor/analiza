import { useId } from 'react'
import clsx from 'clsx'

export function Logo({ className }: { className?: string }) {
  const gradientId = `analiza-logo-gradient-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
        <rect x="7" y="17" width="4" height="8" rx="1" fill="white" />
        <rect x="14" y="12" width="4" height="13" rx="1" fill="white" />
        <rect x="21" y="7" width="4" height="18" rx="1" fill="white" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-slate-100">Analiza</span>
    </span>
  )
}
