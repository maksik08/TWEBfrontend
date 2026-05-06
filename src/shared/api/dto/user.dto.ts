export interface UserDto {
  id: number | string
  email: string
  username?: string
  role: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  balance?: number
}
