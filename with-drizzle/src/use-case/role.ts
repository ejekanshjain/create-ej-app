import {
  createRole,
  deleteRole,
  getRoleWithPermissions,
  getRoles,
  getRolesMini,
  updateRole,
  type RoleType
} from '@/data-access/role'
import {
  RolePermissionType,
  createRolePermissions,
  deleteRolePermissionsByRoleId
} from '@/data-access/role-permission'
import { type UserType } from '@/data-access/user'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'

type getRolesUseCaseInput = {
  page: number
  limit: number
  sortBy?: keyof RoleType
  sortOrder?: SortOrderEnum
  filters?: {
    name?: string
  }
}

export const getRolesUseCase = async (
  currentUserType: UserType['type'],
  { page, limit, sortBy, sortOrder, filters }: getRolesUseCaseInput
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')

  if (limit < 1 || limit > 1000) throw new Error('Invalid limit')
  if (page < 1) throw new Error('Invalid page')

  return await getRoles({
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  })
}

export const getRolesMiniUseCase = async (
  currentUserType: UserType['type']
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')
  return await getRolesMini()
}

export const getRoleWithPermissionsUseCase = async (
  currentUserType: UserType['type'],
  id: string
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')
  return await getRoleWithPermissions(id)
}

type createRoleUseCaseInput = {
  name: string
  permissions: RolePermissionType['permission'][]
}

export const createRoleUseCase = async (
  currentUserType: UserType['type'],
  data: createRoleUseCaseInput
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')
  const roleId = await createRole({
    name: data.name
  })

  if (data.permissions.length)
    await createRolePermissions({
      roleId,
      permissions: data.permissions
    })

  return roleId
}

type updateRoleUseCaseInput = createRoleUseCaseInput & {
  id: string
}

export const updateRoleUseCase = async (
  currentUserType: UserType['type'],
  data: updateRoleUseCaseInput
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')
  await updateRole({
    id: data.id,
    name: data.name
  })
  await deleteRolePermissionsByRoleId(data.id)
  await createRolePermissions({
    roleId: data.id,
    permissions: data.permissions
  })
}

export const deleteRoleUseCase = async (
  currentUserType: UserType['type'],
  id: string
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')
  return await deleteRole(id)
}
