import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/entities/session/model/session.store'
import type { User } from '@/entities/user/model/types'

interface RoleRouteProps {
  allowedRoles: User['role'][]
  children: ReactNode
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const location = useLocation()
  const { user, isAuthenticated, isBootstrapped } = useSessionStore()

  if (!isBootstrapped) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}
