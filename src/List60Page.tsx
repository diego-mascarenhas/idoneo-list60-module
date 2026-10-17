'use client'

import { useQuery } from '@tanstack/react-query'
import type { CSSProperties, ReactNode } from 'react'
import { fetchList60, list60QueryKey } from './api'
import { List60Avatar } from './List60Avatar'
import { List60ChannelHint } from './List60ChannelHint'
import { List60FollowUp } from './List60FollowUp'
import { List60ResponsibleButton } from './List60Responsible'
import { list60CategoryChipStyle, list60ChipClass, list60StatusChipStyle } from './chips'
import type { List60Contact, List60Entry } from './types'

function formatListStatus(status: string): string {
  const attempt = status.match(/^([123]) Contactos?$/i)
  if (!attempt) return status
  return `${attempt[1]}º contacto`
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  if (!year || !month || !day) return value
  return `${Number(day)}/${Number(month)}/${year}`
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

const cardClass =
  'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-solid)] p-4 shadow-[var(--shadow-soft)]'

export type List60CardSlots = {
  action?: ReactNode
  below?: ReactNode
}

export type List60Interaction = (props: {
  contact: List60Contact
  card: (slots?: List60CardSlots) => ReactNode
}) => ReactNode

export function List60Page({
  onOpenContact,
  openingContactId = null,
  notice,
  interaction,
  statusStyle,
  categoryStyle,
}: {
  onOpenContact?: (contact: List60Contact) => void
  openingContactId?: number | null
  notice?: ReactNode
  interaction?: List60Interaction
  statusStyle?: (name: string, labelClass?: string) => CSSProperties | undefined
  categoryStyle?: (color?: string | null) => CSSProperties | undefined
}) {
  const list = useQuery({
    queryKey: list60QueryKey,
    queryFn: fetchList60,
  })
  const entries = list.data?.data ?? []
  const meta = list.data?.meta

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Lista</h1>
        <p className="mt-1 text-[var(--muted)]">
          {meta?.enabled
            ? `${meta.count} contactos para llamar, con el contexto del envío.`
            : 'Contactos para llamar, con el contexto del envío.'}
        </p>
      </div>

      {notice}
      {list.isLoading && <p className="text-[var(--muted)]">Cargando…</p>}
      {list.error && <p className="text-[var(--danger)]">{errorText(list.error, 'No se pudo cargar la lista.')}</p>}

      {meta && !meta.enabled && !list.isLoading && (
        <p className="text-[var(--muted)]">La Lista 60 no está activa en este equipo.</p>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-3">
        {entries.map((entry) => {
          const card = (slots?: List60CardSlots) => (
            <List60Card
              entry={entry}
              action={slots?.action}
              below={slots?.below}
              showInteraction={!interaction}
              onOpenContact={onOpenContact}
              opening={openingContactId === entry.contact.id}
              statusStyle={statusStyle}
              categoryStyle={categoryStyle}
            />
          )

          if (!interaction) {
            return <div key={entry.id}>{card()}</div>
          }

          return <div key={entry.id}>{interaction({ contact: entry.contact, card })}</div>
        })}
        {meta?.enabled && !list.isLoading && entries.length === 0 && (
          <p className="text-[var(--muted)]">Todavía no hay contactos en la lista.</p>
        )}
      </div>
    </div>
  )
}

function List60Card({
  entry,
  action,
  below,
  showInteraction,
  onOpenContact,
  opening = false,
  statusStyle,
  categoryStyle,
}: {
  entry: List60Entry
  action?: ReactNode
  below?: ReactNode
  showInteraction: boolean
  onOpenContact?: (contact: List60Contact) => void
  opening?: boolean
  statusStyle?: (name: string, labelClass?: string) => CSSProperties | undefined
  categoryStyle?: (color?: string | null) => CSSProperties | undefined
}) {
  const contact = entry.contact

  return (
    <List60FollowUp contactId={contact.id} showInteraction={showInteraction} digest={contact.digest} intent={contact.intent}>
      {({ buttons, panel }) => (
        <div className={cardClass}>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <button
              type="button"
              onClick={() => onOpenContact?.(contact)}
              disabled={opening}
              className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:opacity-60"
            >
              <List60Avatar
                photoUrl={contact.photo_url}
                name={contact.display_name}
                email={contact.email}
                sentiment={contact.sentiment}
              />
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div className="min-w-0 font-semibold">
                    {contact.display_name}
                    {contact.status?.name.trim().toLowerCase() === 'cliente' && contact.enterprise
                      ? ` (${contact.enterprise})`
                      : null}
                  </div>
                  {contact.status && (
                    <span
                      className={list60ChipClass}
                      style={
                        statusStyle?.(contact.status.name, contact.status.label_class) ??
                        list60StatusChipStyle(contact.status.name, contact.status.label_class)
                      }
                    >
                      {contact.status.name}
                    </span>
                  )}
                  {contact.intent?.name && (
                    <span className={list60ChipClass} style={list60CategoryChipStyle()} title="Intención">
                      {contact.intent.emoji} {contact.intent.name}
                    </span>
                  )}
                  {entry.status && (
                    <span className="rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--warning)]">
                      {formatListStatus(entry.status)}
                    </span>
                  )}
                </div>
                <div className="mt-1 truncate text-sm text-[var(--muted)]">{contact.email}</div>
                {contact.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {contact.categories.map((category) => (
                      <span
                        key={category.id}
                        className={list60ChipClass}
                        style={categoryStyle?.(category.color) ?? list60CategoryChipStyle(category.color)}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
                <List60ChannelHint contact={contact} />
                {entry.notes && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">{entry.notes}</p>
                )}
              </div>
            </button>
            <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
              {buttons}
              <button
                type="button"
                onClick={() => onOpenContact?.(contact)}
                disabled={opening}
                className="text-xs tabular-nums text-[var(--muted)] disabled:opacity-60"
              >
                Próximo {formatDate(entry.date_next)}
              </button>
              {entry.responsible && (
                <List60ResponsibleButton entryId={entry.id} name={entry.responsible} responsibleId={entry.responsible_id} />
              )}
              {action}
            </div>
          </div>
          {panel}
          {below}
        </div>
      )}
    </List60FollowUp>
  )
}
