'use client'

import { InferSelectModel } from 'drizzle-orm'
import Link from 'next/link'
import { FC } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { Task } from '@/db/schema'
import { formatDateTime, timesAgo } from '@/lib/formatDate'
import { generateLabel } from '@/lib/generateLabel'
import { TaskStatusEnumArr } from './statusEnum'

const statuses = TaskStatusEnumArr.map(x => ({
  label: generateLabel(x),
  value: x
}))

export const Render: FC<{
  data: {
    tasks: {
      id: string
      title: string
      status: InferSelectModel<typeof Task>['status']
      createdBy: {
        id: string
        name?: string | null
      }
      updatedBy?: {
        id: string
        name?: string | null
      } | null
      createdAt: Date
      updatedAt?: Date | null
    }[]
    total: number
  }
}> = ({ data }) => {
  return (
    <Shell>
      <Heading heading="Tasks" text="List of all the tasks">
        <Link href="/tasks/new">
          <Button>
            <Icons.add className="mr-2 h-4 w-4" />
            New
          </Button>
        </Link>
      </Heading>
      <DataTable
        columns={[
          {
            accessorKey: 'title',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Title" />
            ),
            cell: ({ row }) => (
              <Link
                className="underline underline-offset-4"
                href={`/tasks/${row.original.id}`}
              >
                {row.original.title}
              </Link>
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
            cell: ({ row }) =>
              row.original.updatedBy ? row.original.updatedBy.name : undefined,
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
            cell: ({ row }) =>
              row.original.updatedAt
                ? timesAgo(row.original.updatedAt)
                : undefined
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
