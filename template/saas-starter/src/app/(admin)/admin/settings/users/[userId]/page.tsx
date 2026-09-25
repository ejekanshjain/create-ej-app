import { Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getUserById } from '~/app/(admin)/actions/users'
import { PageHeading } from '~/components/page-heading'
import { UserForm } from '../user-form'

interface PageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function AdminUserEditPage({
  params: nextParams
}: PageProps) {
  const params = await nextParams
  const result = await getUserById({ userId: params.userId })

  if (!result?.data) {
    return notFound()
  }

  const user = result.data

  return (
    <div className="space-y-6">
      <PageHeading
        title="Edit User"
        description="Change the user's name, email, and role."
        icon={Users}
      />
      <UserForm
        mode="edit"
        initialData={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }}
      />
    </div>
  )
}
