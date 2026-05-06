export interface User {
  id: string
  email: string
  username?: string
  role: 'admin' | 'client'
  firstName: string
  lastName: string
  phone: string
  balance: number
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  confirmPassword: string
}
