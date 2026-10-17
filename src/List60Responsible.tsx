'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
import { fetchList60Advisors, list60QueryKey, updateList60Responsible, type List60Advisor } from './api'
import type { List60Index } from './types'

function errorText(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'No se pudo cambiar el responsable.'
}

export function List60ResponsibleButton({
  entryId,
  name,
  responsibleId,
}: {
  entryId: number
  name: string
  responsibleId: number | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--muted)] underline decoration-dotted underline-offset-2 hover:text-[var(--text)]"
      >
        {name}
      </button>
      {open && (
        <ResponsibleDialog
          entryId={entryId}
          currentId={responsibleId}
          currentName={name}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function ResponsibleDialog({
  entryId,
  currentId,
  currentName,
  onClose,
}: {
  entryId: number
  currentId: number | null
  currentName: string
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  const pendingRef = useRef(false)
  const titleId = useId()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(currentId)
  onCloseRef.current = onClose
  const advisors = useQuery({
    queryKey: [...list60QueryKey, 'advisors'],
    queryFn: fetchList60Advisors,
  })
  const save = useMutation({
    mutationFn: (responsibleId: number) => updateList60Responsible(entryId, responsibleId),
    onSuccess: (result) => {
      queryClient.setQueryData<List60Index>(list60QueryKey, (current) => {
        if (!current) return current
        return {
          ...current,
          data: current.data.map((entry) =>
            entry.id === entryId
              ? { ...entry, responsible_id: result.responsible_id, responsible: result.responsible_name }
              : entry,
          ),
        }
      })
      onCloseRef.current()
    },
  })
  pendingRef.current = save.isPending

  useEffect(() => {
    const node = dialogRef.current
    if (!node) return
    if (!node.open) node.showModal()
    const onCancel = (event: Event) => {
      event.preventDefault()
      if (!pendingRef.current) onCloseRef.current()
    }
    node.addEventListener('cancel', onCancel)
    return () => {
      node.removeEventListener('cancel', onCancel)
      if (node.open) node.close()
    }
  }, [])

  const people: List60Advisor[] = advisors.data?.users ?? []
  const options =
    currentId && currentName && !people.some((person) => person.id === currentId)
      ? [{ id: currentId, name: currentName }, ...people]
      : people

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="list60-responsible-dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget && !save.isPending) onClose()
      }}
    >
      <style>{`
        .list60-responsible-dialog {
          width: 100vw;
          max-width: none;
          height: 100vh;
          max-height: none;
          margin: 0;
          padding: 1rem;
          border: none;
          background: transparent;
          color: inherit;
        }
        .list60-responsible-dialog[open] {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .list60-responsible-dialog::backdrop {
          background: rgba(16, 36, 40, 0.45);
        }
      `}</style>
      <div className="w-full max-w-sm rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-solid)] p-4 shadow-[var(--shadow-soft)]">
        <h2 id={titleId} className="text-base font-semibold">
          Responsable
        </h2>
        <div className="mt-3 max-h-64 overflow-y-auto">
          {advisors.isLoading && <p className="text-sm text-[var(--muted)]">Cargando…</p>}
          {advisors.error && <p className="text-sm text-[var(--danger)]">{errorText(advisors.error)}</p>}
          <div className="flex flex-col gap-1">
            {options.map((person) => {
              const selected = person.id === selectedId
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  className={
                    selected
                      ? 'rounded-xl bg-[var(--accent)] px-3 py-2 text-left text-sm font-semibold text-white'
                      : 'rounded-xl px-3 py-2 text-left text-sm hover:bg-[var(--bg-deep)]'
                  }
                >
                  {person.name}
                </button>
              )
            })}
          </div>
        </div>
        {save.error && <p className="mt-3 text-sm text-[var(--danger)]">{errorText(save.error)}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={save.isPending || selectedId == null || selectedId === currentId}
            onClick={() => {
              if (selectedId != null) save.mutate(selectedId)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
              <path d="M12 14a2 2 0 1 0 0 -4a2 2 0 0 0 0 4" />
              <path d="M14 4v4h-6v-4" />
            </svg>
            {save.isPending ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            disabled={save.isPending}
            onClick={onClose}
            className="inline-flex items-center rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </dialog>
  )
}
