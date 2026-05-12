import { useMutation } from '@tanstack/react-query'
import { forgotPasswordRequest } from '../api/auth.api'

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => forgotPasswordRequest(data),
  })
}
