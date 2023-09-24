import { Task, TaskStatus } from '@prisma/client'
import { Metadata } from 'next'

import { siteConfig } from '@/lib/siteConfig'
import { getTasks } from './actions'
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

  const status =
    typeof searchParams.status === 'string'
      ? (searchParams.status.split('.') as TaskStatus[])
      : undefined

  const data = await getTasks({
    page,
    limit,
    sortBy,
    sortOrder,
    title,
    status
  })

  return <Render data={data} />
}

export default TasksPage
