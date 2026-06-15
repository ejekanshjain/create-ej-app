import { Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { PageHeading } from '~/components/page-heading'
import { canManageOrganization } from '~/lib/app-navigation'
import {
  getOrganizationMemberCount,
  getUserMembershipCached
} from '~/lib/organization-access'
import { getOrganizationPlanCached } from '~/lib/organization-plan-limits'
import { MembersTabs } from './_components/members-tabs'

export default async function Page({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  const membership = await getUserMembershipCached(orgId)
  if (!membership || !canManageOrganization(membership.role)) {
    return redirect(`/app/${orgId}/dashboard`)
  }

  const [memberCount, { plan }] = await Promise.all([
    getOrganizationMemberCount(orgId),
    getOrganizationPlanCached(orgId)
  ])

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeading
        title="Members"
        description="Invite teammates, manage roles and review pending invitations."
        icon={Users}
      />

      <MembersTabs memberCount={memberCount} maxMembers={plan.maxMembers} />
    </div>
  )
}
