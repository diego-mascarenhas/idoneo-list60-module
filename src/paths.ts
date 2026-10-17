export type List60Paths = {
  index: string
  membership: (contactId: number) => string
  interaction: (contactId: number) => string
  summarize: string
  responsible: (entryId: number) => string
  advisors: string
}

export const defaultList60Paths: List60Paths = {
  index: '/mailer/list60',
  membership: (contactId: number) => `/mailer/audience/${contactId}/list60`,
  interaction: (contactId: number) => `/mailer/audience/${contactId}/interactions`,
  summarize: '/assistant/follow-up/summarize',
  responsible: (entryId: number) => `/assistant/list60/${entryId}/responsible`,
  advisors: '/users?assignable=1',
}
