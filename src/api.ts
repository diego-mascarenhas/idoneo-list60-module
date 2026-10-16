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
