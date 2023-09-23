import { User, UserType } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { authGuard } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { getUsers } from './actions'
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
  const session = await authGuard(['Root'])
  if (!session) return notFound()

  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 10

  const [sortBy, sortOrder] =
    typeof searchParams.sort === 'string'
      ? (searchParams.sort.split('.') as [
          keyof User | undefined,
          'asc' | 'desc' | undefined
        ])
      : []

  const name = searchParams.name
  const email = searchParams.email

  const type =
    typeof searchParams.type === 'string'
      ? (searchParams.type.split('.') as UserType[])
      : undefined

  const data = await getUsers({
    page,
    limit,
    sortBy,
    sortOrder,
    name,
    email,
    type
  })

  return <Render data={data} />
}

export default Users
