import { TaskType, getTasksWithUser } from '@/data-access/task'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'

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

export const getTasksWithUserUseCase = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  filters
}: getUsersUseCaseInput) => {
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
