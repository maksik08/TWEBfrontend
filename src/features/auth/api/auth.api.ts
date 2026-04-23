import { http } from '@/shared/api/http'
import type { AuthResponseDto } from '@/shared/api/dto/auth.dto'
import type { UserDto } from '@/shared/api/dto/user.dto'
import { env } from '@/shared/config/env'
import { mapUserDtoToUser } from '@/entities/user/lib/user.mapper'

interface LocalAccount {
  login: string
  password: string
  user: {
    id: string
    email: string
    username: string
    role: 'client' | 'admin'
  }
}

const builtInAccounts: readonly LocalAccount[] = [
  {
    login: 'client',
    password: 'client123',
    user: {
      id: 'demo-client',
      email: 'client@netinstall.md',
      username: 'client',
      role: 'client',
    },
  },
  {
    login: 'admin',
    password: 'admin123',
    user: {
      id: 'demo-admin',
      email: 'admin@netinstall.md',
      username: 'admin',
      role: 'admin',
    },
  },
]

const REGISTERED_USERS_KEY = 'demo-registered-users'

const readRegisteredAccounts = (): LocalAccount[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(REGISTERED_USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeRegisteredAccounts = (accounts: LocalAccount[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(accounts))
}

const getDemoAccounts = (): LocalAccount[] => [...builtInAccounts, ...readRegisteredAccounts()]

const buildLocalToken = (login: string) => `local-demo:${login}`

const getDemoAccountByToken = (token: string | null) => {
  if (!env.isDev) return null
  if (!token?.startsWith('local-demo:')) return null

  const login = token.replace('local-demo:', '')
  return getDemoAccounts().find((account) => account.login === login) ?? null
}

const findDemoAccount = (identifier: string, password: string) => {
  if (!env.isDev) return null
  return (
    getDemoAccounts().find(
      (account) =>
        (account.login === identifier || account.user.email.toLowerCase() === identifier) &&
        account.password === password,
    ) ?? null
  )
}

const isDemoIdentifierTaken = (email: string, username: string) => {
  return getDemoAccounts().some(
    (account) =>
      account.user.email.toLowerCase() === email || account.login.toLowerCase() === username,
  )
}

export const loginRequest = async (data: { email: string; password: string }) => {
  const identifier = data.email.trim().toLowerCase()
  const localAccount = findDemoAccount(identifier, data.password)

  if (localAccount) {
    return {
      accessToken: buildLocalToken(localAccount.login),
      refreshToken: `local-refresh:${localAccount.login}`,
      user: mapUserDtoToUser(localAccount.user),
    }
  }

  const response = await http.post<AuthResponseDto>('/auth/login', data)

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: mapUserDtoToUser(response.data.user),
  }
}

export const registerRequest = async (data: {
  email: string
  username: string
  password: string
}) => {
  const email = data.email.trim().toLowerCase()
  const username = data.username.trim().toLowerCase()

  if (env.isDev) {
    if (isDemoIdentifierTaken(email, username)) {
      throw new Error('Пользователь с таким email или логином уже существует')
    }

    const newAccount: LocalAccount = {
      login: username,
      password: data.password,
      user: {
        id: `demo-${username}-${Date.now()}`,
        email,
        username,
        role: 'client',
      },
    }

    writeRegisteredAccounts([...readRegisteredAccounts(), newAccount])

    return {
      accessToken: buildLocalToken(newAccount.login),
      refreshToken: `local-refresh:${newAccount.login}`,
      user: mapUserDtoToUser(newAccount.user),
    }
  }

  const response = await http.post<AuthResponseDto>('/auth/register', {
    email,
    username,
    password: data.password,
  })

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: mapUserDtoToUser(response.data.user),
  }
}

export const meRequest = async (token?: string | null) => {
  const localAccount = getDemoAccountByToken(token ?? null)

  if (localAccount) {
    return { user: mapUserDtoToUser(localAccount.user) }
  }

  const response = await http.get<UserDto>('/auth/me')
  return { user: mapUserDtoToUser(response.data) }
}
