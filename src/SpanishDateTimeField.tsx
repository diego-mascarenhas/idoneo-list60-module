'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function parseValue(value: string): Date {
  const [datePart, timePart] = value.split('T')
  const [year, month, day] = (datePart || '').split('-').map(Number)
  const [hour, minute] = (timePart || '00:00').split(':').map(Number)
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day, hour || 0, minute || 0)
}

function toValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatLabel(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function TimeMenu({
  label,
  value,
  length,
  open,
  onToggle,
  onPick,
}: {
  label: string
  value: number
  length: number
  open: boolean
  onToggle: () => void
  onPick: (value: number) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !listRef.current) return
    const current = listRef.current.querySelector('[aria-selected="true"]')
    if (!(current instanceof HTMLElement)) return
    listRef.current.scrollTop = current.offsetTop - listRef.current.clientHeight / 2 + current.offsetHeight / 2
  }, [open])

  return (
    <div className="relative min-w-0 flex-1">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={onToggle}
        className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-solid)] px-2 py-1 text-sm text-[var(--text)]"
      >
        {pad(value)}
        <span aria-hidden className="text-xs text-[var(--muted)]">▾</span>
      </button>
      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label={label}
          className="absolute bottom-full z-10 mb-1 max-h-36 w-full overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--input-bg)] py-1 shadow-[var(--shadow)]"
        >
          {Array.from({ length }, (_, option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => onPick(option)}
              className={[
                'block w-full px-2 py-1 text-left text-sm',
                option === value ? 'bg-[var(--accent)] font-semibold text-white' : 'text-[var(--text)] hover:bg-[var(--chip)]',
              ].join(' ')}
            >
              {pad(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SpanishDateTimeField({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [timeMenu, setTimeMenu] = useState<'hour' | 'minute' | null>(null)
  const [box, setBox] = useState<{ top: number; left: number } | null>(null)
  const selected = parseValue(value)
  const [view, setView] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) setTimeMenu(null)
  }, [open])

  useLayoutEffect(() => {
    if (!open) return

    function place() {
      const button = buttonRef.current
      const popup = popupRef.current
      if (!button || !popup) return
      const rect = button.getBoundingClientRect()
      const margin = 8
      const width = popup.offsetWidth
      const height = popup.offsetHeight
      let left = rect.right - width
      left = Math.min(Math.max(margin, left), window.innerWidth - width - margin)
      let top = rect.bottom + margin
      if (top + height > window.innerHeight - margin) {
        const above = rect.top - margin - height
        top = above >= margin ? above : Math.max(margin, window.innerHeight - height - margin)
      }
      setBox({ top, left })
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, view])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  function commit(next: Date) {
    onChange(toValue(next))
  }

  function pickDay(day: number) {
    commit(new Date(year, month, day, selected.getHours(), selected.getMinutes()))
    setOpen(false)
  }

  function pickTime(hours: number, minutes: number) {
    commit(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), hours, minutes))
  }

  return (
    <div ref={rootRef} className={['relative', className].join(' ')}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setView(new Date(selected.getFullYear(), selected.getMonth(), 1))
          setOpen((current) => !current)
        }}
        className="inline-flex w-full items-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-2 py-2 text-left text-[13px] text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        <span className="min-w-0 flex-1">{formatLabel(selected)}</span>
        <svg className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M4 11h16" />
        </svg>
      </button>
      {open && (
        <div
          ref={popupRef}
          id={listId}
          role="dialog"
          aria-label="Elegir fecha"
          style={box ? { top: box.top, left: box.left } : { visibility: 'hidden' }}
          className="fixed z-30 w-72 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--input-bg)] shadow-[var(--shadow)]"
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--chip)]"
            >
              ‹
            </button>
            <p className="text-sm font-semibold capitalize">
              {MONTHS[month]} {year}
            </p>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--chip)]"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 px-2 pb-2 text-center text-xs">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1 font-medium text-[var(--muted)]">
                {day}
              </span>
            ))}
            {cells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="mx-auto h-8 w-8" />
              }
              const isSelected =
                selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day
              const today = new Date()
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={[
                    'mx-auto grid h-8 w-8 place-items-center rounded-lg text-sm',
                    isSelected ? 'bg-[var(--accent)] font-semibold text-white' : 'hover:bg-[var(--chip)]',
                    !isSelected && isToday ? 'font-semibold text-[var(--accent-strong)]' : '',
                  ].join(' ')}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <div className="flex items-end gap-2 border-t border-[var(--border)] px-3 py-2.5">
            <TimeMenu
              label="Hora"
              value={selected.getHours()}
              length={24}
              open={timeMenu === 'hour'}
              onToggle={() => setTimeMenu((current) => (current === 'hour' ? null : 'hour'))}
              onPick={(hour) => {
                pickTime(hour, selected.getMinutes())
                setTimeMenu(null)
              }}
            />
            <span className="pb-1 text-[var(--muted)]">:</span>
            <TimeMenu
              label="Min"
              value={selected.getMinutes()}
              length={60}
              open={timeMenu === 'minute'}
              onToggle={() => setTimeMenu((current) => (current === 'minute' ? null : 'minute'))}
              onPick={(minute) => {
                pickTime(selected.getHours(), minute)
                setTimeMenu(null)
              }}
            />
          </div>
          <div className="flex justify-end border-t border-[var(--border)] px-3 py-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date()
                setView(new Date(now.getFullYear(), now.getMonth(), 1))
                commit(now)
                setOpen(false)
              }}
              className="text-sm font-medium text-[var(--accent-strong)]"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
