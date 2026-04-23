import { useMutation } from '@tanstack/react-query'
import { registerRequest } from '../api/auth.api'
import { tokenService } from '@/shared/lib/token'
import type { RegisterRequest } from '@/entities/user/model/types'
import { useSessionStore } from '@/entities/session/model/session.store'

export const useRegister = () => {
  const setUser = useSessionStore((state) => state.setUser)

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerRequest(data),

    onSuccess: (data) => {
      tokenService.set(data.accessToken)
      setUser(data.user)
    },
  })
}
