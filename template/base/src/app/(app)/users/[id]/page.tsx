import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard, getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getRolesMiniAction, getUserAction } from './actions'
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
  const session = await getAuthSession()
  if (!session) return notFound()

  const g = await authGuard(session)
  if (!g) return notFound()

  const roles = await getRolesMiniAction(undefined)
  if (!roles?.data) return notFound()

  if (id === 'new') return <Render roles={roles.data} />

  const user = await getUserAction(id)
  if (!user?.data) return notFound()

  return <Render user={user.data} roles={roles.data} />
}

export default UserPage
