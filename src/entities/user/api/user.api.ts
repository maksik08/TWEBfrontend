import { http } from '@/shared/api/http'
import type { UserDto } from '@/shared/api/dto/user.dto'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export const fetchUsers = async (): Promise<UserDto[]> => {
  const { data } = await http.get<PagedResponse<UserDto>>('/users', {
    params: { pageSize: 100, sortBy: 'createdAt', sortDirection: 'desc' },
  })
  return data.data
}

export const setUserBlocked = async (
  id: number | string,
  isBlocked: boolean,
): Promise<UserDto> => {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    throw new Error('Некорректный id пользователя')
  }

  const { data } = await http.patch<ApiResponse<UserDto>>(`/users/${numericId}/block`, {
    isBlocked,
  })
  return data.data
}
