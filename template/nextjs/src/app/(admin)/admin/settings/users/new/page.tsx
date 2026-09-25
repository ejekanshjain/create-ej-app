import { Users } from 'lucide-react'
import { PageHeading } from '~/components/page-heading'
import { UserForm } from '../user-form'

export default function AdminUserCreatePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Create User"
        description="Create a new user and assign a role."
        icon={Users}
      />
      <UserForm mode="create" />
    </div>
  )
}
