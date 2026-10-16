'use client'

import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useState } from 'react'
import { addContactToList60, list60QueryKey, removeContactFromList60 } from './api'

function ListCheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5h10" />
      <path d="M11 9h10" />
      <path d="M11 13h10" />
      <path d="M11 17h10" />
      <path d="M3 5l2 2l4 -4" />
      <path d="M3 17l2 2l4 -4" />
    </svg>
  )
}

export function List60Toggle({
  contactId,
  deliveryId,
  inList,
  invalidateKeys = [],
}: {
  contactId: number
  deliveryId: number
  inList: boolean
  invalidateKeys?: QueryKey[]
}) {
  const queryClient = useQueryClient()
  const [forced, setForced] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const added = forced ?? inList
  const mutation = useMutation({
    mutationFn: (removing: boolean) =>
      removing ? removeContactFromList60(contactId) : addContactToList60(contactId, deliveryId),
    onSuccess: async (_result, removing) => {
      setForced(!removing)
      setError(null)
      await queryClient.invalidateQueries({ queryKey: list60QueryKey })
      for (const queryKey of invalidateKeys) {
        await queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: (caught, removing) => {
      const fallback = removing ? 'No se pudo quitar de la Lista 60.' : 'No se pudo agregar a la Lista 60.'
      setError(caught instanceof Error && caught.message ? caught.message : fallback)
    },
  })

  return (
    <button
      type="button"
      title={error ?? (added ? 'Quitar de la Lista 60' : 'Agregar a la Lista 60')}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(added)}
      className={
        added
          ? 'inline-flex rounded-lg bg-[var(--warning-soft)] p-1 text-[var(--warning)] transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] disabled:opacity-50'
          : 'inline-flex text-[var(--text)] transition hover:text-[var(--accent-strong)] disabled:opacity-50'
      }
    >
      <ListCheckIcon />
    </button>
  )
}
