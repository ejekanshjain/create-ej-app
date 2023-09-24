'use client'

import { TaskStatus } from '@prisma/client'
import Link from 'next/link'
import { FC } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { formatDateTime, timesAgo } from '@/lib/formatDate'
import { generateLabel } from '@/lib/generateLabel'
import { GetTasksFnDataType } from './actions'

const statuses = Object.values(TaskStatus).map(x => ({
  label: generateLabel(x),
  value: x
}))

export const Render: FC<{
  data: GetTasksFnDataType
  canView: boolean
  canCreate: boolean
}> = ({ data, canView, canCreate }) => {
  return (
    <Shell>
      <Heading heading="Tasks" text="List of all the tasks">
        {canCreate ? (
          <Link href="/tasks/new">
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              New
            </Button>
          </Link>
        ) : undefined}
      </Heading>
      <DataTable
        columns={[
          {
            accessorKey: 'title',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Title" />
            ),
            cell: ({ row }) =>
              canView ? (
                <Link
                  className="underline underline-offset-4"
                  href={`/tasks/${row.original.id}`}
                >
                  {row.original.title}
                </Link>
              ) : (
                row.original.title
              )
          },
          {
            accessorKey: 'status',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => row.original.status.replace('_', ' ')
          },
          {
            accessorKey: 'createdBy',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Created By" />
            ),
            cell: ({ row }) => row.original.createdBy.name,
            enableSorting: false
          },
          {
            accessorKey: 'updatedBy',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Updated By" />
            ),
            cell: ({ row }) => row.original.updatedBy.name,
            enableSorting: false
          },
          {
            accessorKey: 'createdAt',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Created At" />
            ),
            cell: ({ row }) => formatDateTime(row.original.createdAt)
          },
          {
            accessorKey: 'updatedAt',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Updated At" />
            ),
            cell: ({ row }) => timesAgo(row.original.updatedAt)
          }
        ]}
        data={data.tasks}
        total={data.total}
        searchableColumns={[
          {
            id: 'title',
            title: 'Title'
          }
        ]}
        filterableColumns={[
          {
            id: 'status',
            title: 'Status',
            options: statuses
          }
        ]}
      />
    </Shell>
  )
}
