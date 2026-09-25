import { notFound } from 'next/navigation'
import { getOrganizationCached } from '~/app/(app)/actions/organizations'
import { SupportTicketsTable } from '~/components/support/support-tickets-table'
import { isManagerRole } from '~/lib/rbac'

export default async function OrganizationSupportTicketsPage({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const org = (await getOrganizationCached(orgId))?.data

  if (!org || !isManagerRole(org.role)) {
    return notFound()
  }

  return (
    <SupportTicketsTable
      mode="app"
      organizationId={orgId}
      basePath={`/app/${orgId}/support-tickets`}
    />
  )
}
