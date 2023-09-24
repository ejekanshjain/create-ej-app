import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { siteConfig } from '@/lib/siteConfig'
import { GetUserFnDataType, getUser } from './actions'
import { Render } from './render'

export const generateMetadata = async (props: {
  params: { id: string }
}): Promise<Metadata> => ({
  title: 'User - ' + props.params.id + ' | ' + siteConfig.name
})

const UserPage = async ({
  params: { id }
}: {
  params: {
    id: string
  }
}) => {
  let user: GetUserFnDataType | undefined

  if (id !== 'new') {
    const x = await getUser(id)
    if (!x) return notFound()
    user = x
  }

  return <Render user={user} />
}

export default UserPage
