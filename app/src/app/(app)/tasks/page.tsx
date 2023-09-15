import { Task, TaskStatus } from '@prisma/client'

import { authGuard, checkForPermission } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { getTasks } from './actions'
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
  const session = await authGuard(['Root', 'Normal'], 'TaskList')
  if (!session) return notFound()

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

  const [canView, canCreate] = await Promise.all([
    checkForPermission('TaskView', session),
    checkForPermission('TaskCreate', session)
  ])

  const data = await getTasks({
    page,
    limit,
    sortBy,
    sortOrder,
    title,
    description,
    status
  })

  return <Render data={data} canView={canView} canCreate={canCreate} />
}

export default TasksPage
