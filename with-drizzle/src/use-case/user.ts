import {
  UserType,
  createUser,
  deleteUser,
  getUserById,
  getUsersWithRole,
  updateUser
} from '@/data-access/user'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'

type UpdateUserNameUseCaseInput = {
  name: string
}

export const updateCurrentUserNameUseCase = async (
  currentUserId: string,
  data: UpdateUserNameUseCaseInput
) => {
  await updateUser(currentUserId, {
    name: data.name
  })
}

type getUsersUseCaseInput = {
  page: number
  limit: number
  sortBy?: keyof UserType
  sortOrder?: SortOrderEnum
  filters?: {
    name?: string
    email?: string
    type?: UserType['type'][]
  }
}

export const getUsersWithRoleUseCase = async (
  currentUserType: UserType['type'],
  { page, limit, sortBy, sortOrder, filters }: getUsersUseCaseInput
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')

  if (limit < 1 || limit > 1000) throw new Error('Invalid limit')
  if (page < 1) throw new Error('Invalid page')

  return await getUsersWithRole({
    page,
    limit,
    sortBy,
    sortOrder,
    filters: filters
      ? {
          name: filters.name,
          email: filters.email,
          type: filters.type
        }
      : undefined
  })
}

export const getUserByIdUseCase = async (
  currentUserType: UserType['type'],
  id: string
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')

  return await getUserById(id)
}

type createUserUseCaseInput = {
  name?: string | null
  email: string
  type: UserType['type']
  roleId?: string | null
}

export const createUserUseCase = async (
  currentUserType: UserType['type'],
  data: createUserUseCaseInput
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')

  return await createUser({
    name: data.name,
    email: data.email,
    type: data.type,
    roleId: data.roleId
  })
}

type updateUserUseCaseInput = {
  name: string
  type: UserType['type']
  roleId?: string | null
}

export const updateUserUseCase = async (
  currentUserType: UserType['type'],
  id: string,
  data: updateUserUseCaseInput
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')

  await updateUser(id, {
    name: data.name,
    type: data.type,
    roleId: data.roleId
  })
}

export const deleteUserUseCase = async (
  currentUserType: UserType['type'],
  id: string
) => {
  if (currentUserType !== 'Root') throw new Error('Unauthorized')

  await deleteUser(id)
}
