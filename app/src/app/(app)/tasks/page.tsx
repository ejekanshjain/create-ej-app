import { Task, TaskStatus } from '@prisma/client'

import { authGuardPage } from '@/lib/auth'
import { getData } from './actions'
import { Render } from './render'

const TasksPage = async ({
  searchParams
}: {
  searchParams: {
    page?: string
    limit?: string
    sort?: string
    title?: string
    description?: string
    status?: string
  }
}) => {
  await authGuardPage(undefined, 'TaskList')

  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 10

  const [sortBy, sortOrder] =
    typeof searchParams.sort === 'string'
      ? (searchParams.sort.split('.') as [
          keyof Task | undefined,
          'asc' | 'desc' | undefined
        ])
      : []

  const title = searchParams.title
  const description = searchParams.description

  const status =
    typeof searchParams.status === 'string'
      ? (searchParams.status.split('.') as TaskStatus[])
      : undefined

  const data = await getData({
    page,
    limit,
    sortBy,
    sortOrder,
    title,
    description,
    status
  })

  return <Render data={data} />
}

export default TasksPage
