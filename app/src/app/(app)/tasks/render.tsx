'use client'

import { FC } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GetDataFnDataType } from './actions'

export const Render: FC<{ data: GetDataFnDataType }> = ({ data }) => {
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
            accessorKey: 'description',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Description" />
            )
          },
          {
            accessorKey: 'status',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Status" />
            )
          }
        ]}
        data={data.tasks}
        total={data.total}
        searchableColumns={[
          {
            id: 'title',
            title: 'Title'
          },
          {
            id: 'description',
            title: 'Description'
          }
        ]}
        filterableColumns={[
          {
            id: 'status',
            title: 'Status',
            options: [
              {
                label: 'Backlog',
                value: 'Backlog'
              },
              {
                label: 'Todo',
                value: 'Todo'
              },
              {
                label: 'In_Progress',
                value: 'In_Progress'
              },
              {
                label: 'Done',
                value: 'Done'
              },
              {
                label: 'Cancelled',
                value: 'Cancelled'
              }
            ]
          }
        ]}
      />
    </Shell>
  )
}
