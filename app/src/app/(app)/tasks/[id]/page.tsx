import { Metadata } from 'next'
import { Session } from 'next-auth'
import { notFound } from 'next/navigation'

import { authGuard, checkForPermission } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { GetTaskFnDataType, getTask } from './actions'
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
  let session: Session
  let task: GetTaskFnDataType | undefined

  if (id === 'new') {
    const tempSession = await authGuard(undefined, 'TaskCreate')
    if (!tempSession) return notFound()
    session = tempSession
  } else {
    const tempSession = await authGuard(undefined, 'TaskView')
    if (!tempSession) return notFound()
    session = tempSession
    const t = await getTask(id)
    if (!t) return notFound()
    task = t
  }

  const [canUpdate, canCreate, canDelete] = await Promise.all([
    checkForPermission('TaskUpdate', session),
    checkForPermission('TaskCreate', session),
    checkForPermission('TaskDelete', session)
  ])

  return (
    <Render
      task={task}
      canUpdate={canUpdate}
      canCreate={canCreate}
      canDelete={canDelete}
    />
  )
}

export default TaskPage
