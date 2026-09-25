import { notFound } from 'next/navigation'
import { getOrganizationCached } from '~/app/(app)/actions/organizations'
import { SupportTicketConversation } from '~/components/support/support-ticket-conversation'
import { isManagerRole } from '~/lib/rbac'

export default async function OrganizationSupportTicketPage({
  params
}: {
  params: Promise<{ orgId: string; ticketId: string }>
}) {
  const { orgId, ticketId } = await params
  const org = (await getOrganizationCached(orgId))?.data

  if (!org || !isManagerRole(org.role)) {
    return notFound()
  }

  return (
    <SupportTicketConversation
      mode="app"
      ticketId={ticketId}
      backHref={`/app/${orgId}/support-tickets`}
    />
  )
}
