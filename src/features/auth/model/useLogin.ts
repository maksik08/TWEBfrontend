import { useMutation } from '@tanstack/react-query'
import { loginRequest } from '../api/auth.api'
import { tokenService } from '@/shared/lib/token'
import type { LoginRequest } from '@/entities/user/model/types'
import { useSessionStore } from '@/entities/session/model/session.store'

export const useLogin = () => {
  const setUser = useSessionStore((state) => state.setUser)

  return useMutation({
    mutationFn: (data: LoginRequest) => loginRequest(data),

    onSuccess: (data) => {
      tokenService.set(data.accessToken)
      setUser(data.user)
    },
  })
}
