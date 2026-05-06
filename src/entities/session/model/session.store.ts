import { create } from 'zustand'
import type { User } from '@/entities/user/model/types'
import { tokenService } from '@/shared/lib/token'

interface SessionState {
  user: User | null
  isAuthenticated: boolean
  isBootstrapped: boolean
  setUser: (user: User) => void
  patchUser: (patch: Partial<User>) => void
  setBootstrapped: (value: boolean) => void
  logout: () => void
}

const PER_USER_STORES = ['cart', 'favorites', 'profile']

const clearPerUserState = () => {
  if (typeof window === 'undefined') return
  PER_USER_STORES.forEach((key) => window.localStorage.removeItem(key))
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: !!tokenService.get(),
  isBootstrapped: false,

  setUser: (user) =>
    set((state) => {
      if (state.user && state.user.id !== user.id) {
        clearPerUserState()
      }
      return { user, isAuthenticated: true }
    }),

  patchUser: (patch) =>
    set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),

  setBootstrapped: (value) =>
    set({
      isBootstrapped: value,
    }),

  logout: () => {
    tokenService.remove()
    clearPerUserState()
    set({
      user: null,
      isAuthenticated: false,
      isBootstrapped: true,
    })
  },
}))
