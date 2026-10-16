import type { List60Contact } from './types'

function lastMessageLabel(channel: string, status: string): string {
  const name = channel === 'whatsapp' ? 'WhatsApp' : 'email'
  if (status === 'failed') return `Último ${name} fallido`
  if (status === 'delivered') return `Último ${name} entregado`
  return `Último ${name}`
}

export function List60ChannelHint({ contact }: { contact: List60Contact }) {
  const last = contact.last_message
  const showError = (error: string | null | undefined, channel: string) =>
    Boolean(error) && !(last?.channel === channel && last.summary === error)

  if (
    contact.whatsapp_valid !== false &&
    !contact.email_last_error &&
    !contact.whatsapp_last_error &&
    !last
  ) {
    return null
  }

  return (
    <div className="mt-1 min-w-0 space-y-0.5 text-xs [overflow-wrap:anywhere]">
      {showError(contact.email_last_error, 'email') && (
        <div className="text-[var(--danger)]">Último error de email: {contact.email_last_error}</div>
      )}
      {contact.whatsapp_valid === false && <div className="text-[var(--danger)]">WhatsApp inválido</div>}
      {showError(contact.whatsapp_last_error, 'whatsapp') && (
        <div className="text-[var(--danger)]">Último error de WhatsApp: {contact.whatsapp_last_error}</div>
      )}
      {last && (
        <div className="text-[var(--muted)]">
          {lastMessageLabel(last.channel, last.status)}
          {last.summary ? `: ${last.summary}` : ''}
        </div>
      )}
    </div>
  )
}
