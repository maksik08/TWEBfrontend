import { create } from 'zustand'
import type { User } from '@/entities/user/model/types'
import { tokenService } from '@/shared/lib/token'

interface SessionState {
  user: User | null
  isAuthenticated: boolean
  isBootstrapped: boolean
  setUser: (user: User) => void
  setBootstrapped: (value: boolean) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: !!tokenService.get(),
  isBootstrapped: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  setBootstrapped: (value) =>
    set({
      isBootstrapped: value,
    }),

  logout: () => {
    tokenService.remove()
    set({
      user: null,
      isAuthenticated: false,
      isBootstrapped: true,
    })
  },
}))
