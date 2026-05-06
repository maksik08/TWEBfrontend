export interface User {
  id: string
  email: string
  username?: string
  role: 'admin' | 'client'
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
