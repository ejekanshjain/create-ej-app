import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { type RoleType } from '@/data-access/role'
import { authGuard, getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getRolesAction } from './actions'
import { Render } from './render'

export const metadata: Metadata = {
  title: 'Roles' + ' | ' + siteConfig.name
}

const RolesPage = async ({
  searchParams
}: {
  searchParams: {
    page?: string
    limit?: string
    sort?: string
    name?: string
  }
}) => {
  const session = await getAuthSession()
  if (!session) return notFound()

  const g = await authGuard(session)
  if (!g) return notFound()

  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 10

  const [sortBy, sortOrder] =
    typeof searchParams.sort === 'string'
      ? (searchParams.sort.split('.') as [
          keyof RoleType | undefined,
          'asc' | 'desc' | undefined
        ])
      : []

  const name = searchParams.name

  const data = await getRolesAction({
    page,
    limit,
    sortBy,
    sortOrder,
    name
  })

  if (!data?.data) throw new Error('Roles Data not found')

  return <Render data={data.data} />
}

export default RolesPage
