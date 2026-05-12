import { useMutation } from '@tanstack/react-query'
import { submitContactRequest, type ContactFormPayload } from '../api/contact.api'

export const useSubmitContact = () => {
  return useMutation({
    mutationFn: (payload: ContactFormPayload) => submitContactRequest(payload),
  })
}
