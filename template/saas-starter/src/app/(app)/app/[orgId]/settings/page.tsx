import { Settings } from 'lucide-react'
import { redirect } from 'next/navigation'
import { PageHeading } from '~/components/page-heading'
import { Separator } from '~/components/ui/separator'
import { canManageOrganization } from '~/lib/app-navigation'
import {
  getOrganizationMembers,
  getUserMembershipCached,
  getUserOrganizationsCached
} from '~/lib/organization-access'
import { resolveImageUrl } from '~/lib/storage'
import { DangerZone } from './_components/danger-zone'
import { GeneralSettingsForm } from './_components/general-settings-form'

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

  const org = (await getUserOrganizationsCached()).find(o => o.id === orgId)
  if (!org) {
    return redirect('/app')
  }

  const members = await getOrganizationMembers(orgId)
  const isOwner = membership.role === 'owner'
  const transferTargets = members
    .filter(m => m.id !== membership.id)
    .map(m => ({
      memberId: m.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role
    }))

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeading
        title="General"
        description="Manage your organization's profile and settings."
        icon={Settings}
      />

      <GeneralSettingsForm
        orgId={orgId}
        defaultName={org.name}
        defaultSlug={org.slug}
        currentLogoUrl={resolveImageUrl(org.logo)}
        currentLogoKey={org.logo}
      />

      <Separator />

      <DangerZone
        orgId={orgId}
        orgName={org.name}
        isOwner={isOwner}
        transferTargets={transferTargets}
      />
    </div>
  )
}
