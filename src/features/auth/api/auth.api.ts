import { http } from '@/shared/api/http'
import type { AuthResponseDto } from '@/shared/api/dto/auth.dto'
import type { UserDto } from '@/shared/api/dto/user.dto'
import { env } from '@/shared/config/env'
import { mapUserDtoToUser } from '@/entities/user/lib/user.mapper'

const demoAccounts = [
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
] as const

const buildLocalToken = (login: string) => `local-demo:${login}`

const getDemoAccountByToken = (token: string | null) => {
  if (!env.isDev) return null
  if (!token?.startsWith('local-demo:')) return null

  const login = token.replace('local-demo:', '')
  return demoAccounts.find((account) => account.login === login) ?? null
}

const findDemoAccount = (identifier: string, password: string) => {
  if (!env.isDev) return null
  return (
    demoAccounts.find(
      (account) =>
        (account.login === identifier || account.user.email.toLowerCase() === identifier) &&
        account.password === password,
    ) ?? null
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

export const meRequest = async (token?: string | null) => {
  const localAccount = getDemoAccountByToken(token ?? null)

  if (localAccount) {
    return { user: mapUserDtoToUser(localAccount.user) }
  }

  const response = await http.get<UserDto>('/auth/me')
  return { user: mapUserDtoToUser(response.data) }
}
