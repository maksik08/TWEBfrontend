import { http } from '@/shared/api/http'
import type { AuthResponseDto } from '@/shared/api/dto/auth.dto'
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
  if (!token?.startsWith('local-demo:')) return null

  const login = token.replace('local-demo:', '')
  return demoAccounts.find((account) => account.login === login) ?? null
}

const createLocalAuthResponse = (account: (typeof demoAccounts)[number]) => ({
  accessToken: buildLocalToken(account.login),
  refreshToken: `local-refresh:${account.login}`,
  user: account.user,
})

export const loginRequest = async (data: { email: string; password: string }) => {
  const identifier = data.email.trim().toLowerCase()
  const localAccount =
    demoAccounts.find(
      (account) =>
        (account.login === identifier || account.user.email.toLowerCase() === identifier) &&
        account.password === data.password,
    ) ?? null

  if (localAccount) {
    const response = createLocalAuthResponse(localAccount)
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: mapUserDtoToUser(response.user),
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
    const response = createLocalAuthResponse(localAccount)
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: mapUserDtoToUser(response.user),
    }
  }

  const response = await http.get<AuthResponseDto>('/auth/me')

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: mapUserDtoToUser(response.data.user),
  }
}
