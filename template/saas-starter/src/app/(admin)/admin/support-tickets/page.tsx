import { SupportTicketsTable } from '~/components/support/support-tickets-table'

export default function AdminSupportTicketsPage() {
  return <SupportTicketsTable mode="admin" basePath="/admin/support-tickets" />
}
