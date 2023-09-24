import { Metadata } from 'next'

import { siteConfig } from '@/lib/siteConfig'
import { getTask } from './actions'
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
  const task = id === 'new' ? await getTask(id) : undefined

  return <Render task={task} />
}

export default TaskPage
