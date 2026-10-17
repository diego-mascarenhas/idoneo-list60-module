'use client'

import { useState } from 'react'
import type { List60Mood } from './types'

function initials(name?: string | null, email?: string | null): string {
  const source = (name || email || '?').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

function Badge({ emoji, label, className }: { emoji: string; label: string; className: string }) {
  return (
    <span
      title={label}
      aria-label={label}
      className={[
        'absolute flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-solid)] text-[13px] leading-none shadow-[var(--shadow-soft)]',
        className,
      ].join(' ')}
    >
      {emoji}
    </span>
  )
}

export function List60Avatar({
  photoUrl,
  name,
  email,
  sentiment,
}: {
  photoUrl?: string | null
  name?: string | null
  email?: string | null
  sentiment?: List60Mood | null
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showPhoto = Boolean(photoUrl) && failedUrl !== photoUrl

  const face = showPhoto && photoUrl ? (
    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--accent-soft)]">
      <img
        src={photoUrl}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => setFailedUrl(photoUrl)}
      />
    </span>
  ) : (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-strong)]">
      {initials(name, email)}
    </span>
  )

  return (
    <span className="relative inline-flex h-10 w-10 shrink-0">
      {face}
      {sentiment?.emoji ? (
        <Badge emoji={sentiment.emoji} label={`Estado de ánimo: ${sentiment.name}`} className="-right-1 -top-1" />
      ) : null}
    </span>
  )
}
