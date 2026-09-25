import { Settings } from 'lucide-react'
import { notFound } from 'next/navigation'
import {
  getOrganizationCached,
  getTransferTargets
} from '~/app/(app)/actions/organizations'
import { PageHeading } from '~/components/page-heading'
import { Separator } from '~/components/ui/separator'
import { DangerZone } from './_components/danger-zone'
import { GeneralSettingsForm } from './_components/general-settings-form'

export default async function GeneralSettingsPage({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const org = (await getOrganizationCached(orgId))?.data

  if (!org) {
    return notFound()
  }

  const isOwner = org.role === 'owner'
  const transferTargets = isOwner
    ? ((await getTransferTargets(orgId))?.data ?? [])
    : []

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeading
        title="General"
        description="Change your organization's name, link, and logo."
        icon={Settings}
      />

      <GeneralSettingsForm
        orgId={orgId}
        defaultName={org.name}
        defaultSlug={org.slug}
        currentLogoKey={org.logo}
        currentLogoUrl={org.logoUrl}
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
