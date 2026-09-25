import { SupportTicketConversation } from '~/components/support/support-ticket-conversation'

export default async function AccountSupportTicketPage({
  params
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <SupportTicketConversation
        mode="app"
        ticketId={ticketId}
        backHref="/support"
      />
    </div>
  )
}
