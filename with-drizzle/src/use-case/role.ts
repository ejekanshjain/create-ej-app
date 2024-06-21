import { getRoles, getRolesMini, type RoleType } from '@/data-access/role'
import { type UserType } from '@/data-access/user'

type getRolesInput = {
  page: number
  limit: number
  sortBy?: keyof RoleType
  sortOrder?: 'asc' | 'desc'
  search?: {
    name?: string
  }
}

export const getRolesUseCase = async (
  currentUserType: UserType['type'],
  { page, limit, sortBy, sortOrder, search }: getRolesInput
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')
  return await getRoles({
    page,
    limit,
    sortBy,
    sortOrder,
    search
  })
}

export const getRolesMiniUseCase = async (
  currentUserType: UserType['type']
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')
  return await getRolesMini()
}
