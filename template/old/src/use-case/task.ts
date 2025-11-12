import {
  getResourcesByTaskId,
  updateResourceByIds
} from '@/data-access/resource'
import {
  TaskType,
  createTask,
  deleteTask,
  getTaskByIdWithUser,
  getTasksWithUser,
  updateTask
} from '@/data-access/task'
import { CurrentUser } from '@/lib/currentUser'
import { deleteFile } from '@/lib/s3Client'
import { type SortOrderEnum } from '@/lib/sortOrderEnum'
import { checkForRolePermissionUseCase } from './role-permission'

const handleTaskImages = async (
  imageIds: string[],
  taskId: string,
  updatedById: string
) => {
  const prevImages = await getResourcesByTaskId(taskId)

  for (const p of prevImages) {
    if (imageIds.includes(p.id)) continue
    await deleteFile(p.id)
  }

  if (imageIds.length)
    await updateResourceByIds({
      ids: imageIds,
      taskId,
      updatedById
    })
}

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
  currentUser: CurrentUser,
  { page, limit, sortBy, sortOrder, filters }: getUsersUseCaseInput
) => {
  const c = await checkForRolePermissionUseCase(
    currentUser.type,
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

export const getTaskByIdWithUserUseCase = async (
  currentUser: CurrentUser,
  id: string
) => {
  const c = await checkForRolePermissionUseCase(
    currentUser.type,
    currentUser.roleId,
    'TaskView'
  )
  if (!c) throw new Error('Unauthorized')

  return await getTaskByIdWithUser(id)
}

type createTaskUseCaseInput = {
  title: string
  description?: string | null
  status: TaskType['status']
  imageIds?: string[] | null
}

export const createTaskUseCase = async (
  currentUser: CurrentUser,
  data: createTaskUseCaseInput
) => {
  const c = await checkForRolePermissionUseCase(
    currentUser.type,
    currentUser.roleId,
    'TaskCreate'
  )
  if (!c) throw new Error('Unauthorized')

  const taskId = await createTask({
    title: data.title,
    description: data.description,
    status: data.status,
    createdById: currentUser.id
  })

  if (taskId)
    await handleTaskImages(data.imageIds || [], taskId, currentUser.id)

  return taskId
}

type updateTaskUseCaseInput = {
  id: string
  title?: string
  description?: string | null
  status?: TaskType['status']
  imageIds?: string[] | null
}

export const updateTaskUseCase = async (
  currentUser: CurrentUser,
  data: updateTaskUseCaseInput
) => {
  const c = await checkForRolePermissionUseCase(
    currentUser.type,
    currentUser.roleId,
    'TaskUpdate'
  )
  if (!c) throw new Error('Unauthorized')

  const result = await updateTask({
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    updatedById: currentUser.id
  })

  await handleTaskImages(data.imageIds || [], data.id, currentUser.id)

  return result
}

export const deleteTaskUseCase = async (
  currentUser: CurrentUser,
  id: string
) => {
  const c = await checkForRolePermissionUseCase(
    currentUser.type,
    currentUser.roleId,
    'TaskDelete'
  )
  if (!c) throw new Error('Unauthorized')

  return await deleteTask(id)
}
