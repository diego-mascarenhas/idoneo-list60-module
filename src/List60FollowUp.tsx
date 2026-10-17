'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { recordList60Interaction, summarizeList60Contact } from './api'
import { SpanishDateTimeField } from './SpanishDateTimeField'
import type { List60Digest, List60Intent } from './types'

const interactionTypes = [
  { value: 'call', label: 'Llamada' },
  { value: 'email', label: 'Correo' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'note', label: 'Nota' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'other', label: 'Otro' },
] as const

type InteractionType = (typeof interactionTypes)[number]['value']

function nowLocalInput(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function PencilIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20h4l10.5 -10.5a2.121 2.121 0 0 0 -3 -3l-10.5 10.5v3" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z" />
      <path d="M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z" />
      <path d="M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
    </svg>
  )
}

function TypeIcon({ type }: { type: InteractionType }) {
  const common = {
    className: 'h-3 w-3',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (type === 'call') {
    return (
      <svg {...common}>
        <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
      </svg>
    )
  }

  if (type === 'email') {
    return (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
        <path d="M3 7l9 6l9 -6" />
      </svg>
    )
  }

  if (type === 'meeting') {
    return (
      <svg {...common}>
        <path d="M9 7a4 4 0 1 0 0 8a4 4 0 0 0 0 -8" />
        <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
      </svg>
    )
  }

  if (type === 'note') {
    return (
      <svg {...common}>
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    )
  }

  if (type === 'whatsapp') {
    return (
      <svg {...common}>
        <path d="M3 20l1.3 -3.9a9 9 0 1 1 3.4 2.9z" />
        <path d="M8 10h.01" />
        <path d="M12 10h.01" />
        <path d="M16 10h.01" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M5 12h.01" />
      <path d="M12 12h.01" />
      <path d="M19 12h.01" />
    </svg>
  )
}

function messageFrom(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function savedAdvice(digest: List60Digest | null | undefined, intent: List60Intent | null | undefined): string | null {
  const channel = interactionTypes.find((item) => item.value === digest?.channel)
  const intentLabel = intent ? `${intent.emoji} ${intent.name}` : null
  const advice = [intentLabel, channel?.label].filter(Boolean).join(' · ')
  return advice || null
}

export function List60FollowUp({
  contactId,
  showInteraction,
  digest = null,
  intent = null,
  children,
}: {
  contactId: number
  showInteraction: boolean
  digest?: List60Digest | null
  intent?: List60Intent | null
  children: (parts: { buttons: ReactNode; panel: ReactNode | null }) => ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const [type, setType] = useState<InteractionType>('call')
  const [occurredAt, setOccurredAt] = useState(nowLocalInput)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(digest?.summary ?? null)
  const [advice, setAdvice] = useState<string | null>(savedAdvice(digest, intent))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [clearIntent, setClearIntent] = useState(Boolean(digest?.intent_key && digest.intent_key !== 'unclear'))
  const [suggestedId, setSuggestedId] = useState<number | null>(null)

  async function saveInteraction() {
    setSaving(true)
    setError(null)
    try {
      const response = await recordList60Interaction(contactId, {
        type,
        subject: subject.trim() || undefined,
        body: body.trim() || undefined,
        occurred_at: occurredAt.replace('T', ' '),
        interaction_id: suggestedId ?? undefined,
      })
      setSaved(response.data.type_label)
      setSubject('')
      setBody('')
      hideForm()
    } catch (caught) {
      setError(messageFrom(caught, 'No se pudo guardar la interacción.'))
    } finally {
      setSaving(false)
    }
  }

  async function summarize() {
    setSummarizing(true)
    setError(null)
    try {
      const response = await summarizeList60Contact(contactId)
      setSummary(response.summary)
      setClearIntent(response.suggestion?.clear === true)
      const channel = interactionTypes.find((item) => item.value === response.suggestion?.channel)
      const intentLabel = response.intent ? `${response.intent.emoji} ${response.intent.name}` : null
      setAdvice([intentLabel, channel?.label].filter(Boolean).join(' · ') || null)
      if (response.suggestion && channel) {
        setType(channel.value)
        setSubject(response.suggestion.subject)
        setBody(response.suggestion.body)
        revealForm()
      }
      if (response.interaction) {
        setSuggestedId(response.interaction.id)
        setSaved(response.interaction.type_label)
      }
    } catch (caught) {
      setError(messageFrom(caught, 'No se pudo resumir la conversación.'))
    } finally {
      setSummarizing(false)
    }
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [])

  function revealForm() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOccurredAt(nowLocalInput())
    setError(null)
    setMounted(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setExpanded(true))
    })
  }

  function hideForm() {
    setExpanded(false)
    closeTimer.current = window.setTimeout(() => {
      setMounted(false)
      closeTimer.current = null
    }, 200)
  }

  const buttons = (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      {saved && <p className="text-[10px] text-[var(--success)]">Interacción guardada: {saved}</p>}
      <div className="flex items-center gap-1">
        {showInteraction && !expanded && (
          <button
            type="button"
            onClick={revealForm}
            className="inline-flex h-6 items-center gap-1 rounded-md border border-[var(--accent)] bg-[var(--accent-soft)] px-1.5 text-[10px] font-medium leading-none text-[var(--accent-strong)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-60"
          >
            <PencilIcon />
            Interacción
          </button>
        )}
        <button
          type="button"
          onClick={() => void summarize()}
          disabled={summarizing}
          className="inline-flex h-6 items-center gap-1 rounded-md border border-[var(--cta)] bg-[var(--cta)] px-1.5 text-[10px] font-medium leading-none text-[var(--cta-text)] hover:bg-[var(--cta-strong)] disabled:opacity-60"
        >
          <SparklesIcon />
          {summarizing ? 'Resumiendo…' : 'Resumen'}
        </button>
      </div>
    </div>
  )

  const panel =
    mounted || summary || error ? (
      <div className="mt-3 border-t border-[var(--border)]">
        {(summary || error) && (
          <div className="grid gap-3 pt-3">
            {summary && (
              <div className="rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--text)]">
                <p className="whitespace-pre-line leading-relaxed">{summary.replace(/\\r\\n|\\n|\\r/g, '\n')}</p>
                {advice && (
                  <p className="mt-2 text-xs font-semibold text-[var(--accent-strong)]">
                    {clearIntent ? 'Intención clara' : 'Cómo seguir'}: {advice}
                  </p>
                )}
              </div>
            )}
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          </div>
        )}
        {mounted && (
          <div
            className={[
              'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
              expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            ].join(' ')}
          >
            <div className="overflow-hidden">
          <form
            className="grid gap-3 pt-3"
            onSubmit={(event) => {
              event.preventDefault()
              void saveInteraction()
            }}
          >
            <div className="flex flex-wrap gap-1.5">
              {interactionTypes.map((item) => {
                const selected = type === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    className={[
                      'inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium leading-none transition',
                      selected
                        ? 'border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                        : 'border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]',
                    ].join(' ')}
                  >
                    <TypeIcon type={item.value} />
                    {item.label}
                  </button>
                )
              })}
            </div>
            <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <label className="block text-xs font-medium text-[var(--muted)]">
                Asunto
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Fecha
                <SpanishDateTimeField value={occurredAt} onChange={setOccurredAt} className="mt-1.5" />
              </label>
            </div>
            <label className="block text-xs font-medium text-[var(--muted)]">
              Detalles
              <textarea
                value={body}
                rows={3}
                onChange={(event) => setBody(event.target.value)}
                className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
                  <path d="M12 14a2 2 0 1 0 0 -4a2 2 0 0 0 0 4" />
                  <path d="M14 4v4h-6v-4" />
                </svg>
                {saving ? 'Guardando…' : 'Guardar interacción'}
              </button>
              <button
                type="button"
                onClick={() => {
                  hideForm()
                  setError(null)
                }}
                className="inline-flex items-center rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]"
              >
                Cancelar
              </button>
            </div>
          </form>
            </div>
          </div>
        )}
      </div>
    ) : null

  return children({ buttons, panel })
}
