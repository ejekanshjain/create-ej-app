import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard, getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getRoleAction } from './actions'
import { Render } from './render'

export const generateMetadata = async (props: {
  params: { id: string }
}): Promise<Metadata> => ({
  title: 'Role - ' + props.params.id + ' | ' + siteConfig.name
})

const RolePage = async ({
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

  if (id == 'new') return <Render />

  const role = await getRoleAction(id)

  if (!role?.data) return notFound()

  return (
    <Render
      role={{
        id: role.data.id,
        name: role.data.name,
        permissions: role.data.permissions.map(p => p.permission),
        createdAt: role.data.createdAt,
        updatedAt: role.data.updatedAt
      }}
    />
  )
}

export default RolePage
