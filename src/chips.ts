import type { CSSProperties } from 'react'

const STATUS_LABEL_COLORS: Record<string, string> = {
  'bg-label-success': '#28c76f',
  'bg-label-warning': '#ffab00',
  'bg-label-info': '#00cfe8',
  'bg-label-primary': '#696cff',
  'bg-label-danger': '#ea5455',
  'bg-label-dark': '#4b4b4b',
  'bg-label-secondary': '#82868b',
}

const STATUS_NAME_COLORS: Record<string, string> = {
  lead: STATUS_LABEL_COLORS['bg-label-success'],
  leads: STATUS_LABEL_COLORS['bg-label-success'],
  'en seguimiento': STATUS_LABEL_COLORS['bg-label-warning'],
  follow_up: STATUS_LABEL_COLORS['bg-label-warning'],
  conversion: STATUS_LABEL_COLORS['bg-label-info'],
  conversions: STATUS_LABEL_COLORS['bg-label-info'],
  cliente: STATUS_LABEL_COLORS['bg-label-primary'],
  clients: STATUS_LABEL_COLORS['bg-label-primary'],
  perdido: STATUS_LABEL_COLORS['bg-label-danger'],
  lost: STATUS_LABEL_COLORS['bg-label-danger'],
  finalizado: STATUS_LABEL_COLORS['bg-label-dark'],
  finished: STATUS_LABEL_COLORS['bg-label-dark'],
}

export const list60ChipClass =
  'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none'

function chipStyle(tone: string): CSSProperties {
  return {
    borderColor: tone,
    color: tone,
    backgroundColor: `color-mix(in srgb, ${tone} 16%, transparent)`,
  }
}

function statusTone(name?: string | null, labelClass?: string | null): string {
  if (labelClass && STATUS_LABEL_COLORS[labelClass]) return STATUS_LABEL_COLORS[labelClass]
  const key = (name ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[_-]+/g, ' ')
  return STATUS_NAME_COLORS[key] ?? STATUS_LABEL_COLORS['bg-label-secondary']
}

export function list60StatusChipStyle(name?: string | null, labelClass?: string | null): CSSProperties {
  return chipStyle(statusTone(name, labelClass))
}

export function list60CategoryChipStyle(color?: string | null): CSSProperties {
  const tone = color?.trim() || '#1f5c45'
  return chipStyle(tone)
}
