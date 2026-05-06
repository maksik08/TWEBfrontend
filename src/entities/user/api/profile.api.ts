import { http } from '@/shared/api/http'
import type { UserDto } from '@/shared/api/dto/user.dto'
import { mapUserDtoToUser } from '@/entities/user/lib/user.mapper'
import type { User } from '@/entities/user/model/types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface UpdateProfilePayload {
  firstName: string
  lastName: string
  phone: string
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  const { data } = await http.put<ApiResponse<UserDto>>('/profile/me', payload)
  return mapUserDtoToUser(data.data)
}

export const topUpBalance = async (amount: number): Promise<User> => {
  const { data } = await http.post<ApiResponse<UserDto>>('/profile/me/topup', { amount })
  return mapUserDtoToUser(data.data)
}
