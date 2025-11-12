import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard, getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getTaskAction } from './actions'
import { Render } from './render'

export const generateMetadata = async (props: {
  params: { id: string }
}): Promise<Metadata> => ({
  title: 'Task - ' + props.params.id + ' | ' + siteConfig.name
})

const TaskPage = async ({
  params: { id }
}: {
  params: {
    id: string
  }
}) => {
  const session = await getAuthSession()
  if (!session) return notFound()

  const g = await authGuard(session, 'TaskView')
  if (!g) return notFound()

  const [canCreate, canUpdate, canDelete] = await Promise.all([
    authGuard(session, 'TaskCreate'),
    authGuard(session, 'TaskUpdate'),
    authGuard(session, 'TaskDelete')
  ])

  if (id === 'new') {
    if (!canCreate) return notFound()

    return (
      <Render
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    )
  }

  const task = await getTaskAction(id)
  if (!task?.data) return notFound()

  return (
    <Render
      task={task.data}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  )
}

export default TaskPage
