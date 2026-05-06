import type { UserDto } from '@/shared/api/dto/user.dto'
import type { User } from '@/entities/user/model/types'

const normalizeRole = (role: string): User['role'] =>
  role.trim().toLowerCase() === 'admin' ? 'admin' : 'client'

export const mapUserDtoToUser = (dto: UserDto): User => {
  return {
    id: String(dto.id),
    email: dto.email,
    username: dto.username,
    role: normalizeRole(dto.role),
  }
}
