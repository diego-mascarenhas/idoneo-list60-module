import { getList60Client } from './http'
import type { List60Index, List60Membership } from './types'

export const list60QueryKey = ['list60'] as const

export function fetchList60(): Promise<List60Index> {
  const { request, paths } = getList60Client()
  return request<List60Index>(paths.index)
}

export function addContactToList60(contactId: number, deliveryId: number): Promise<List60Membership> {
  const { request, paths } = getList60Client()
  return request<List60Membership>(paths.membership(contactId), {
    method: 'POST',
    body: { delivery_id: deliveryId },
  })
}

export function removeContactFromList60(contactId: number): Promise<List60Membership> {
  const { request, paths } = getList60Client()
  return request<List60Membership>(paths.membership(contactId), { method: 'DELETE' })
}

export function recordList60Interaction(
  contactId: number,
  payload: { type: string; subject?: string; body?: string; occurred_at: string; interaction_id?: number },
): Promise<{ data: { type_label: string } }> {
  const { request, paths } = getList60Client()
  return request(paths.interaction(contactId), { method: 'POST', body: payload })
}

export type List60Suggestion = {
  channel: string
  subject: string
  body: string
  clear: boolean
}

export type List60Advisor = {
  id: number
  name: string
}

export function fetchList60Advisors(): Promise<{ users: List60Advisor[] }> {
  const { request, paths } = getList60Client()
  return request(paths.advisors)
}

export function updateList60Responsible(
  entryId: number,
  responsibleId: number,
): Promise<{ responsible_id: number; responsible_name: string }> {
  const { request, paths } = getList60Client()
  return request(paths.responsible(entryId), {
    method: 'PATCH',
    body: { responsible_id: responsibleId },
  })
}

export function summarizeList60Contact(contactId: number): Promise<{
  summary: string
  intent: { name: string; emoji: string } | null
  suggestion?: List60Suggestion
  interaction?: { id: number; type: string; type_label: string } | null
}> {
  const { request, paths } = getList60Client()
  return request(paths.summarize, { method: 'POST', body: { contact_id: contactId } })
}
