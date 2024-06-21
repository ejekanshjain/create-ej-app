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
  userType: UserType['type'],
  { page, limit, sortBy, sortOrder, search }: getRolesInput
) => {
  if (userType !== 'Root') throw new Error('Unauthorized')
  return await getRoles({
    page,
    limit,
    sortBy,
    sortOrder,
    search
  })
}

export const getRolesMiniUseCase = async (userType: UserType['type']) => {
  if (userType !== 'Root') throw new Error('Unauthorized')
  return await getRolesMini()
}
