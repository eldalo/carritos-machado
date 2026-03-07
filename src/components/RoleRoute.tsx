import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions'
import type { Permission } from '../hooks/usePermissions'

interface RoleRouteProps {
  children: ReactNode
  permission: Permission
  fallback: string
}

export default function RoleRoute({ children, permission, fallback }: RoleRouteProps) {
  const { can } = usePermissions()

  if (!can(permission)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
