import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getRolesMini } from '../../roles/actions'
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
  const session = await authGuard(['Root'])
  if (!session) return notFound()

  let user: GetUserFnDataType | undefined

  if (id !== 'new') {
    const x = await getUser(id)
    if (!x) return notFound()
    user = x
  }

  const roles = await getRolesMini()

  return <Render user={user} roles={roles} />
}

export default UserPage
