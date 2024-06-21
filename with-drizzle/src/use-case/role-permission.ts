'use server'

import {
  checkForRolePermission,
  type RolePermissionType
} from '@/data-access/role-permission'
import { type UserType } from '@/data-access/user'

export const checkForRolePermissionUseCase = async (
  userType: UserType['type'],
  roleId?: string | null,
  permission?: RolePermissionType['permission']
) => {
  if (userType === 'Root') return true

  if (!roleId) return false

  if (!permission) return true

  return await checkForRolePermission(roleId, permission)
}
