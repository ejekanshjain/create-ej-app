import { UserCog } from 'lucide-react'
import { PageHeading } from '~/components/page-heading'
import { ProfileForm } from './profile-form'

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeading
        title="Your Profile"
        description="Update your name and review your account details."
        icon={UserCog}
      />
      <ProfileForm />
    </div>
  )
}
