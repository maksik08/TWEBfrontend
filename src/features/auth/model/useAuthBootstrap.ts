import { useEffect } from 'react'
import { meRequest } from '../api/auth.api'
import { tokenService } from '@/shared/lib/token'
import { useSessionStore } from '@/entities/session/model/session.store'

export const useAuthBootstrap = () => {
  const setUser = useSessionStore((state) => state.setUser)
  const logout = useSessionStore((state) => state.logout)
  const setBootstrapped = useSessionStore((state) => state.setBootstrapped)

  useEffect(() => {
    const onLogout = () => logout()
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [logout])

  useEffect(() => {
    const token = tokenService.get()

    if (!token) {
      setBootstrapped(true)
      return
    }

    const initAuth = async () => {
      try {
        const { user } = await meRequest()
        setUser(user)
      } catch {
        logout()
      } finally {
        setBootstrapped(true)
      }
    }

    initAuth()
  }, [logout, setBootstrapped, setUser])
}
