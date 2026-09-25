import { SupportTicketConversation } from '~/components/support/support-ticket-conversation'

export default async function AdminSupportTicketDetailsPage({
  params
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params

  return (
    <SupportTicketConversation
      mode="admin"
      ticketId={ticketId}
      backHref="/admin/support-tickets"
    />
  )
}
