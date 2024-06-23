import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { GetRoleFnDataType, getRole } from './actions'
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
  const session = await authGuard(['Root'])
  if (!session) return notFound()

  let role: GetRoleFnDataType | undefined

  if (id !== 'new') {
    const x = await getRole(id)
    if (!x) return notFound()
    role = x
  }

  return <Render role={role} />
}

export default RolePage
