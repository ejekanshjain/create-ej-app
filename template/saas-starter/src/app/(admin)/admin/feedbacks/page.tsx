'use client'

import { MessageSquare, Star } from 'lucide-react'
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates
} from 'nuqs'
import { DataTable, type DataTableColumnDef } from '~/components/data-table'
import { SortOrderEnum } from '~/components/data-table/enum'
import { DataTableFilter } from '~/components/data-table/types'
import { PageHeading } from '~/components/page-heading'
import { formatDate } from '~/lib/format-date'
import { useSafeActionQuery } from '~/lib/safe-action-client'
import { getFeedbacks } from '../../actions/feedbacks'

type Feedback = {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  userId: string
  organizationId: string
  userName: string | null
  userEmail: string | null
  organizationName: string | null
}

const filters: DataTableFilter[] = [
  {
    id: 'rating',
    label: 'Rating',
    options: [5, 4, 3, 2, 1].map(rating => ({
      label: rating === 1 ? '1 Star' : `${rating} Stars`,
      value: String(rating)
    }))
  }
]

const columns: DataTableColumnDef<Feedback>[] = [
  {
    accessorKey: 'user',
    header: 'User',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {row.original.userName || 'Anonymous'}
        </span>
        <span className="text-muted-foreground text-xs">
          {row.original.userEmail || '-'}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">{row.original.rating}</span>
        <Star className="fill-warning text-warning h-4 w-4" />
      </div>
    )
  },
  {
    accessorKey: 'organization',
    header: 'Organization',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.organizationName || (
          <span className="text-muted-foreground italic">Deleted</span>
        )}
      </span>
    )
  },
  {
    accessorKey: 'comment',
    header: 'Comment',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground line-clamp-2 max-w-100 text-sm">
        {row.original.comment || (
          <span className="italic">No comment provided</span>
        )}
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

export default function FeedbacksPage() {
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
      'createdAt' | 'rating' | undefined,
    sortOrder: (queryState.sortOrder ?? undefined) as SortOrderEnum | undefined,
    search: queryState.search ?? undefined,
    filters: queryState.filters ?? undefined
  }

  const { data, isLoading } = useSafeActionQuery(
    'admin-feedbacks',
    getFeedbacks,
    params
  )

  return (
    <div className="space-y-6">
      <PageHeading
        title="Feedback"
        description="Ratings and comments sent from the app."
        icon={MessageSquare}
      />

      <DataTable
        columns={columns}
        data={data?.[0]}
        isLoading={isLoading}
        totalCount={data?.[1]}
        enableSearch
        initialSearch={params.search}
        searchPlaceholder="Search by comment or user…"
        manualPagination
        manualSorting
        pageIndex={params.page - 1}
        pageSize={params.limit}
        filters={filters}
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
