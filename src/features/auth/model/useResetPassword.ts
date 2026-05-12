import { useMutation } from '@tanstack/react-query'
import { resetPasswordRequest } from '../api/auth.api'

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string; confirmPassword: string }) =>
      resetPasswordRequest(data),
  })
}
