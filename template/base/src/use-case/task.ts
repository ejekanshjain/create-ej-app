import { TaskType, getTasksWithUser } from '@/data-access/task'
import { UserType } from '@/data-access/user'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'
import { checkForRolePermissionUseCase } from './role-permission'

type getUsersUseCaseInput = {
  page: number
  limit: number
  sortBy?: keyof TaskType
  sortOrder?: SortOrderEnum
  filters?: {
    title?: string
    status?: TaskType['status'][]
  }
}

export const getTasksWithUserUseCase = async (
  currentUser: {
    userType: UserType['type']
    roleId?: string | null
  },
  { page, limit, sortBy, sortOrder, filters }: getUsersUseCaseInput
) => {
  const c = await checkForRolePermissionUseCase(
    currentUser.userType,
    currentUser.roleId,
    'TaskList'
  )
  if (!c) throw new Error('Unauthorized')

  if (limit < 1 || limit > 1000) throw new Error('Invalid limit')
  if (page < 1) throw new Error('Invalid page')

  return await getTasksWithUser({
    page,
    limit,
    sortBy,
    sortOrder,
    filters: filters
      ? {
          title: filters.title,
          status: filters.status
        }
      : undefined
  })
}
