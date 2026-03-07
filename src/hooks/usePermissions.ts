import { useAuth } from '../context/AuthContext'

export type Permission =
  | 'schedule:view'
  | 'schedule:edit'
  | 'participants:view'
  | 'participants:add'
  | 'participants:remove'
  | 'blocks:view'
  | 'blocks:edit'
  | 'points:view'
  | 'points:add'
  | 'points:edit'
  | 'points:remove'

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'schedule:view',
    'schedule:edit',
    'participants:view',
    'participants:add',
    'participants:remove',
    'blocks:view',
    'blocks:edit',
    'points:view',
    'points:add',
    'points:edit',
    'points:remove',
  ],
  assistant: [
    'schedule:view',
    'schedule:edit',
    'participants:view',
    'participants:add',
    'participants:remove',
  ],
  user: [
    'schedule:view',
    'participants:view',
  ],
}

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role || 'user'
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user

  return {
    can: (permission: Permission) => permissions.includes(permission),
    role,
  }
}
