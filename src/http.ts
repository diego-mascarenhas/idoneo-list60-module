import { defaultList60Paths, type List60Paths } from './paths'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export type List60Request = <T>(path: string, options?: { method?: string; body?: unknown }) => Promise<T>

type Client = {
  request: List60Request
  paths: List60Paths
}

let client: Client | null = null

export function configureList60(next: Client): void {
  client = next
}

export function getList60Client(): Client {
  if (!client) {
    throw new ApiError('idoneo-list60-module no está configurado.', 500, null)
  }

  return client
}

export function list60Paths(): List60Paths {
  return getList60Client().paths
}

export { defaultList60Paths }
