import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard, getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getTasksAction } from './actions'
import { Render } from './render'

export const metadata: Metadata = {
  title: 'Tasks' + ' | ' + siteConfig.name
}

const TasksPage = async ({
  searchParams
}: {
  searchParams: {
    page?: string
    limit?: string
    sort?: string
    title?: string
    status?: string
  }
}) => {
  const session = await getAuthSession()
  if (!session) return notFound()

  const g = await authGuard(session, 'TaskList')
  if (!g) return notFound()

  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 10

  const [sortBy, sortOrder] =
    typeof searchParams.sort === 'string'
      ? (searchParams.sort.split('.') as [any, 'asc' | 'desc' | undefined])
      : []

  const title = searchParams.title

  const status =
    typeof searchParams.status === 'string'
      ? (searchParams.status.split('.') as any[])
      : undefined

  const tasks = await getTasksAction({
    page,
    limit,
    sortBy,
    sortOrder,
    title,
    status
  })

  if (!tasks?.data) throw new Error('Tasks data not found')

  return <Render data={tasks.data} />
}

export default TasksPage
