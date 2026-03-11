import type { UserDto } from '@/shared/api/dto/user.dto'
import type { User } from '@/entities/user/model/types'

export const mapUserDtoToUser = (dto: UserDto): User => {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.role === 'admin' ? 'admin' : 'client',
  }
}
