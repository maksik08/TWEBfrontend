import { http } from '@/shared/api/http'
import type { UserDto } from '@/shared/api/dto/user.dto'
import { mapUserDtoToUser } from '@/entities/user/lib/user.mapper'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface AuthPayload {
  token: string
  user: UserDto
}

export const loginRequest = async (data: { username: string; password: string }) => {
  const response = await http.post<ApiResponse<AuthPayload>>('/auth/login', data)
  const payload = response.data.data

  return {
    accessToken: payload.token,
    user: mapUserDtoToUser(payload.user),
  }
}

export const registerRequest = async (data: {
  email: string
  username: string
  password: string
  confirmPassword: string
}) => {
  const response = await http.post<ApiResponse<AuthPayload>>('/auth/register', {
    email: data.email.trim().toLowerCase(),
    username: data.username.trim(),
    password: data.password,
    confirmPassword: data.confirmPassword,
  })
  const payload = response.data.data

  return {
    accessToken: payload.token,
    user: mapUserDtoToUser(payload.user),
  }
}

export const meRequest = async () => {
  const response = await http.get<ApiResponse<UserDto>>('/profile/me')
  return { user: mapUserDtoToUser(response.data.data) }
}

export const logoutRequest = async () => {
  await http.post('/auth/logout')
}

export const forgotPasswordRequest = async (data: { email: string }) => {
  await http.post('/auth/forgot-password', {
    email: data.email.trim().toLowerCase(),
  })
}

export const resetPasswordRequest = async (data: {
  token: string
  newPassword: string
  confirmPassword: string
}) => {
  await http.post('/auth/reset-password', {
    token: data.token,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  })
}
