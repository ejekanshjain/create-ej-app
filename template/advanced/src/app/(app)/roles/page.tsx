import { Role } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getRoles } from './actions'
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
  const session = await authGuard(['Root'])
  if (!session) return notFound()

  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 10

  const [sortBy, sortOrder] =
    typeof searchParams.sort === 'string'
      ? (searchParams.sort.split('.') as [
          keyof Role | undefined,
          'asc' | 'desc' | undefined
        ])
      : []

  const name = searchParams.name

  const data = await getRoles({
    page,
    limit,
    sortBy,
    sortOrder,
    name
  })

  return <Render data={data} />
}

export default RolesPage
