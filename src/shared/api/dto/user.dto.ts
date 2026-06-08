export interface UserDto {
  id: number | string
  email: string
  username?: string
  role: string
  isBlocked?: boolean
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  balance?: number
}
