import { http } from '@/shared/api/http'

export interface ContactFormPayload {
  name: string
  email: string
  subject: string
  message: string
}

export const submitContactRequest = async (payload: ContactFormPayload): Promise<void> => {
  await http.post('/contact', {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
  })
}
