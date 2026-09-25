'use client'

import { Eye, Plus, Ticket } from 'lucide-react'
import Link from 'next/link'
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates
} from 'nuqs'
import {
  getAdminSupportTicketsAction,
  getMyAccountSupportTicketsAction,
  getOrganizationSupportTicketsAction,
  getSupportTicketOrganizationsAction
} from '~/app/actions/support-tickets'
import { DataTable, type DataTableColumnDef } from '~/components/data-table'
import { SortOrderEnum } from '~/components/data-table/enum'
import { DataTableFilter } from '~/components/data-table/types'
import { PageHeading } from '~/components/page-heading'
import { Button } from '~/components/ui/button'
import { formatDate } from '~/lib/format-date'
import { useSafeActionQuery } from '~/lib/safe-action-client'
import { CreateSupportTicketDialog } from './create-support-ticket-dialog'
import {
  SupportPriorityBadge,
  SupportStatusBadge,
  supportPriorityOptions,
  supportStatusOptions
} from './support-ticket-shared'

type SupportTicket = {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string | null
  createdAt: Date
  resolvedAt: Date | null
  userId: string | null
  userName: string | null
  userEmail: string | null
  organizationId: string | null
  organizationName: string | null
}

const baseFilters: DataTableFilter[] = [
  {
    id: 'status',
    label: 'Status',
    options: supportStatusOptions.map(option => ({
      label: option.label,
      value: option.value
    }))
  },
  {
    id: 'priority',
    label: 'Priority',
    options: supportPriorityOptions.map(option => ({
      label: option.label,
      value: option.value
    }))
  }
]

// Only the platform view spans organizations, so only it filters by one.
const adminFilters: DataTableFilter[] = [
  ...baseFilters,
  {
    id: 'organizationId',
    label: 'Organization',
    action: getSupportTicketOrganizationsAction,
    queryKey: 'support-ticket-organizations'
  }
]

type SupportTicketsTableProps =
  | { mode: 'admin' | 'account'; basePath: string; organizationId?: undefined }
  | { mode: 'app'; basePath: string; organizationId: string }

const COPY = {
  admin: {
    title: 'Support Tickets',
    description: 'View, respond to, and manage customer support conversations.',
    searchPlaceholder: 'Search by ticket #, subject, user, or organization…'
  },
  app: {
    title: 'Support Tickets',
    description:
      'Every ticket for this organization. Owners and admins can reply to all of them.',
    searchPlaceholder: 'Search by ticket # or subject…'
  },
  account: {
    title: 'Support',
    description:
      "Tickets about your account. To raise one about an organization, use that organization's support page.",
    searchPlaceholder: 'Search by ticket # or subject…'
  }
} as const

export function SupportTicketsTable({
  mode,
  basePath,
  organizationId
}: SupportTicketsTableProps) {
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    sortBy: parseAsString,
    sortOrder: parseAsString,
    search: parseAsString,
    filters: parseAsJson(v => v as Record<string, (string | boolean)[]>)
  })

  const params = {
    page: queryState.page,
    limit: queryState.limit,
    sortBy: (queryState.sortBy ?? undefined) as
      | 'ticketNumber'
      | 'subject'
      | 'status'
      | 'priority'
      | 'createdAt'
      | 'resolvedAt'
      | undefined,
    sortOrder: (queryState.sortOrder ?? undefined) as SortOrderEnum | undefined,
    search: queryState.search ?? undefined,
    filters: queryState.filters ?? undefined
  }

  const adminQuery = useSafeActionQuery(
    'admin-support-tickets',
    getAdminSupportTicketsAction,
    params,
    { enabled: mode === 'admin' }
  )
  const organizationQuery = useSafeActionQuery(
    `support-tickets-${organizationId}`,
    getOrganizationSupportTicketsAction,
    { ...params, organizationId: organizationId! },
    { enabled: mode === 'app' }
  )
  const accountQuery = useSafeActionQuery(
    'account-support-tickets',
    getMyAccountSupportTicketsAction,
    params,
    { enabled: mode === 'account' }
  )
  const { data, isLoading } =
    mode === 'admin'
      ? adminQuery
      : mode === 'app'
        ? organizationQuery
        : accountQuery

  const columns: DataTableColumnDef<SupportTicket>[] = [
    {
      accessorKey: 'ticketNumber',
      header: 'Ticket #',
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.ticketNumber}</span>
      )
    },
    {
      accessorKey: 'subject',
      header: mode === 'account' ? 'Subject' : 'Subject & Raised by',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="line-clamp-1 text-sm font-medium">
            {row.original.subject}
          </span>
          {mode === 'account' ? null : (
            <span className="text-muted-foreground text-xs">
              {row.original.userName ||
                row.original.userEmail ||
                'Removed user'}
            </span>
          )}
        </div>
      )
    },
    ...(mode === 'admin'
      ? [
          {
            accessorKey: 'organizationName',
            header: 'Organization',
            enableSorting: false,
            cell: ({ row }: { row: { original: SupportTicket } }) =>
              row.original.organizationId ? (
                <span className="line-clamp-1 text-sm">
                  {row.original.organizationName || 'Unknown'}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">Account</span>
              )
          } satisfies DataTableColumnDef<SupportTicket>
        ]
      : []),
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => <SupportStatusBadge status={row.original.status} />
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      enableSorting: true,
      cell: ({ row }) => (
        <SupportPriorityBadge priority={row.original.priority} />
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.createdAt, { short: true })
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href={`${basePath}/${row.original.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View ticket</span>
          </Link>
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeading
        title={COPY[mode].title}
        description={COPY[mode].description}
        icon={Ticket}
      >
        {mode === 'admin' ? null : (
          <CreateSupportTicketDialog
            organizationId={organizationId}
            redirectBasePath={basePath}
          >
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </CreateSupportTicketDialog>
        )}
      </PageHeading>

      <DataTable
        columns={columns}
        data={data?.[0]}
        isLoading={isLoading}
        totalCount={data?.[1]}
        enableSearch
        initialSearch={params.search}
        searchPlaceholder={COPY[mode].searchPlaceholder}
        manualPagination
        manualSorting
        pageIndex={params.page - 1}
        pageSize={params.limit}
        filters={mode === 'admin' ? adminFilters : baseFilters}
        activeFilters={params.filters ?? {}}
        onParamsChange={({ page, limit, sortBy, sortOrder, search, filters }) =>
          setQueryState({
            page,
            limit,
            sortBy: sortBy ?? null,
            sortOrder: sortOrder ?? null,
            search: search ?? null,
            filters: filters ?? null
          })
        }
      />
    </div>
  )
}
