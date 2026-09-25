import { Badge } from '~/components/ui/badge'

export const supportStatusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Waiting on Customer', value: 'waiting_customer' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' }
] as const

export const supportPriorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
] as const

export type SupportTicketStatus = (typeof supportStatusOptions)[number]['value']
export type SupportTicketPriority =
  (typeof supportPriorityOptions)[number]['value']

export function formatSupportLabel(value: string | null) {
  if (!value) return '-'
  return value.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export function SupportStatusBadge({ status }: { status: string }) {
  const variantMap = {
    open: 'info',
    in_progress: 'info',
    waiting_customer: 'warning',
    resolved: 'success',
    closed: 'secondary'
  } as const

  const variant = variantMap[status as keyof typeof variantMap] ?? 'secondary'

  return <Badge variant={variant}>{formatSupportLabel(status)}</Badge>
}

export function SupportPriorityBadge({
  priority
}: {
  priority: string | null
}) {
  if (!priority) return <span className="text-muted-foreground">-</span>

  const variantMap = {
    low: 'outline',
    medium: 'secondary',
    high: 'warning',
    urgent: 'destructive'
  } as const

  const variant = variantMap[priority as keyof typeof variantMap] ?? 'secondary'

  return <Badge variant={variant}>{formatSupportLabel(priority)}</Badge>
}
