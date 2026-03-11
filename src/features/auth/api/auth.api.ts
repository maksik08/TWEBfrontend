import { http } from '@/shared/api/http'
import type { AuthResponseDto } from '@/shared/api/dto/auth.dto'
import { mapUserDtoToUser } from '@/entities/user/lib/user.mapper'

export const loginRequest = async (
  data: { email: string; password: string },
) => {
  const response = await http.post<AuthResponseDto>(
    '/auth/login',
    data,
  )

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: mapUserDtoToUser(response.data.user),
  }
}

export const meRequest = async () => {
  const response = await http.get<AuthResponseDto>('/auth/me')

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: mapUserDtoToUser(response.data.user),
  }
}
