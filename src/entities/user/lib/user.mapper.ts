import type { UserDto } from '@/shared/api/dto/user.dto'
import type { User } from '@/entities/user/model/types'

export const mapUserDtoToUser = (dto: UserDto): User => {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    role: dto.role === 'admin' ? 'admin' : 'client',
  }
}
