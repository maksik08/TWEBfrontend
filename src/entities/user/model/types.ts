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
  email: string
  password: string
}
