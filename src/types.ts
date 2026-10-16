export type List60ContactStatus = {
  id: number
  name: string
  label_class?: string
}

export type List60Category = {
  id: number
  name: string
  color?: string | null
}

export type List60LastMessage = {
  channel: string
  at: string
  status: string
  summary: string
}

export type List60Contact = {
  id: number
  display_name: string
  email: string
  photo_url?: string | null
  status: List60ContactStatus | null
  categories: List60Category[]
  whatsapp_valid?: boolean | null
  email_last_error?: string | null
  whatsapp_last_error?: string | null
  last_message?: List60LastMessage | null
}

export type List60Entry = {
  id: number
  contact: List60Contact
  status: string | null
  date_next: string | null
  notes: string | null
  responsible: string | null
}

export type List60Index = {
  data: List60Entry[]
  meta: {
    enabled: boolean
    count: number
    limit: number
  }
}

export type List60Membership = {
  success: boolean
  data: {
    contact_id: number
    in_list60: boolean
    already?: boolean
  }
}
