import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard, getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getUsersAction } from './actions'
import { Render } from './render'

export const metadata: Metadata = {
  title: 'Users' + ' | ' + siteConfig.name
}

const Users = async ({
  searchParams
}: {
  searchParams: {
    page?: string
    limit?: string
    sort?: string
    name?: string
    email?: string
    type?: string
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
      ? (searchParams.sort.split('.') as [any, 'asc' | 'desc' | undefined])
      : []

  const name = searchParams.name
  const email = searchParams.email

  const type =
    typeof searchParams.type === 'string'
      ? (searchParams.type.split('.') as any[])
      : undefined

  const data = await getUsersAction({
    page,
    limit,
    sortBy,
    sortOrder,
    name,
    email,
    type
  })

  if (!data?.data) throw new Error('Users data not found')

  return <Render data={data.data} />
}

export default Users
