'use client'

import { useState } from 'react'

function initials(name?: string | null, email?: string | null): string {
  const source = (name || email || '?').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

export function List60Avatar({
  photoUrl,
  name,
  email,
}: {
  photoUrl?: string | null
  name?: string | null
  email?: string | null
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showPhoto = Boolean(photoUrl) && failedUrl !== photoUrl

  if (showPhoto && photoUrl) {
    return (
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--accent-soft)]">
        <img
          src={photoUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailedUrl(photoUrl)}
        />
      </span>
    )
  }

  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-strong)]">
      {initials(name, email)}
    </span>
  )
}
