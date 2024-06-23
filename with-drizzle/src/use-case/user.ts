import { UserType, getUsersWithRole, updateUserById } from '@/data-access/user'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'

type UpdateUserNameUseCaseInput = {
  name: string
}

export const updateUserNameUseCase = async (
  id: string,
  data: UpdateUserNameUseCaseInput
) => {
  await updateUserById(id, {
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
