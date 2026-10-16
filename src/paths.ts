export type List60Paths = {
  index: string
  membership: (contactId: number) => string
}

export const defaultList60Paths: List60Paths = {
  index: '/mailer/list60',
  membership: (contactId: number) => `/mailer/audience/${contactId}/list60`,
}
