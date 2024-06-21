'use server'

import { InferSelectModel, and, count, eq } from 'drizzle-orm'

import { db } from '@/db'
import { RolePermission } from '@/db/schema'

export type RolePermissionType = InferSelectModel<typeof RolePermission>

export const checkForRolePermission = async (
  roleId: string,
  permission: RolePermissionType['permission']
) => {
  const c = await db
    .select({ count: count() })
    .from(RolePermission)
    .where(
      and(
        eq(RolePermission.roleId, roleId),
        eq(RolePermission.permission, permission)
      )
    )

  return !!c?.[0]?.count
}

type createRolePermissionsInput = {
  roleId: string
  permissions: RolePermissionType['permission'][]
}

export const createRolePermissions = async (
  data: createRolePermissionsInput
) => {
  return await db.insert(RolePermission).values(
    data.permissions.map(p => ({
      roleId: data.roleId,
      permission: p
    }))
  )
}

export const deleteRolePermissionsByRoleId = async (roleId: string) => {
  return await db
    .delete(RolePermission)
    .where(eq(RolePermission.roleId, roleId))
}
