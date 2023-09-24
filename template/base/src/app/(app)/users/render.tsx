'use client'

import Link from 'next/link'
import { FC } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { formatDateTime, timesAgo } from '@/lib/formatDate'
import { GetUsersFnDataType } from './actions'

export const Render: FC<{
  data: GetUsersFnDataType
}> = ({ data }) => {
  return (
    <Shell>
      <Heading heading="Users" text="List of all the users">
        <Link href="/users/new">
          <Button>
            <Icons.add className="mr-2 h-4 w-4" />
            New
          </Button>
        </Link>
      </Heading>
      <DataTable
        columns={[
          {
            accessorKey: 'name',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => (
              <Link
                className="underline underline-offset-4"
                href={`/users/${row.original.id}`}
              >
                {row.original.name}
              </Link>
            )
          },
          {
            accessorKey: 'email',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Email" />
            )
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
        data={data.users}
        total={data.total}
        searchableColumns={[
          {
            id: 'name',
            title: 'Name'
          },
          {
            id: 'email',
            title: 'Email'
          }
        ]}
      />
    </Shell>
  )
}
