import { notFound } from 'next/navigation'
import { getAuthSession } from '~/lib/auth'
import { UsersTable } from './_components/users-table'

export default async function UsersPage() {
  const authSession = await getAuthSession()
  if (!authSession) return notFound()

  return (
    <UsersTable
      isSuperAdmin={authSession.isSuperAdmin ?? false}
      currentUserId={authSession.user.id}
    />
  )
}
