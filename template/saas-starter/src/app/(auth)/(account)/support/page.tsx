import { SupportTicketsTable } from '~/components/support/support-tickets-table'

export default function AccountSupportPage() {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <SupportTicketsTable mode="account" basePath="/support" />
    </div>
  )
}
