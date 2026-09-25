import { Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getMemberUsage } from '~/app/(app)/actions/members'
import { PageHeading } from '~/components/page-heading'
import { MembersTabs } from './_components/members-tabs'

export default async function MembersPage({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const usage = (await getMemberUsage(orgId))?.data

  if (!usage) {
    return notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeading
        title="Members"
        description="Invite teammates, change roles, and review invitations."
        icon={Users}
      />

      <MembersTabs
        memberCount={usage.memberCount}
        maxMembers={usage.maxMembers}
      />
    </div>
  )
}
