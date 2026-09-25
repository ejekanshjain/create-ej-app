'use client'

import { MessageSquare } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { DataTable, type DataTableColumnDef } from '~/components/data-table'
import { SortOrderEnum } from '~/components/data-table/enum'
import { PageHeading } from '~/components/page-heading'
import { formatDate } from '~/lib/format-date'
import { useSafeActionQuery } from '~/lib/safe-action-client'
import { getContactLeads } from '../../actions/contact-leads'

type ContactLead = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  createdAt: Date
}

const columns: DataTableColumnDef<ContactLead>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{row.original.name}</span>
        <span className="text-muted-foreground text-xs">
          {row.original.email}
        </span>
        {row.original.phone && (
          <span className="text-muted-foreground text-xs">
            {row.original.phone}
          </span>
        )}
      </div>
    )
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.subject}</span>
    )
  },
  {
    accessorKey: 'message',
    header: 'Message',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground line-clamp-2 max-w-100 text-sm">
        {row.original.message}
      </span>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'Submitted On',
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.createdAt, { short: true })
  }
]

export default function ContactLeadsPage() {
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    sortBy: parseAsString,
    sortOrder: parseAsString,
    search: parseAsString
  })

  const params = {
    page: queryState.page,
    limit: queryState.limit,
    sortBy: (queryState.sortBy ?? undefined) as
      'createdAt' | 'name' | 'email' | undefined,
    sortOrder: (queryState.sortOrder ?? undefined) as SortOrderEnum | undefined,
    search: queryState.search ?? undefined
  }

  const { data, isLoading } = useSafeActionQuery(
    'admin-contact-leads',
    getContactLeads,
    params
  )

  return (
    <div className="space-y-6">
      <PageHeading
        title="Contact Leads"
        description="View contact form submissions."
        icon={MessageSquare}
      />

      <DataTable
        columns={columns}
        data={data?.[0]}
        isLoading={isLoading}
        totalCount={data?.[1]}
        enableSearch
        initialSearch={params.search}
        searchPlaceholder="Search by name, email, subject, or message…"
        manualPagination
        manualSorting
        pageIndex={params.page - 1}
        pageSize={params.limit}
        onParamsChange={({ page, limit, sortBy, sortOrder, search }) =>
          setQueryState({
            page,
            limit,
            sortBy: sortBy ?? null,
            sortOrder: sortOrder ?? null,
            search: search ?? null
          })
        }
      />
    </div>
  )
}
