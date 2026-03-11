import type { UserDto } from './user.dto'

export interface AuthResponseDto {
  accessToken: string
  refreshToken: string
  user: UserDto
}