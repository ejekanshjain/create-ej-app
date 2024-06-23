import { User } from '@prisma/client'
import { Metadata } from 'next'

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
  }
}) => {
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

  const data = await getUsers({
    page,
    limit,
    sortBy,
    sortOrder,
    name,
    email
  })

  return <Render data={data} />
}

export default Users
