'use client'

import Link from 'next/link'
import { FC } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { User } from '@/db/schema'
import { formatDateTime, timesAgo } from '@/lib/formatDate'
import { generateLabel } from '@/lib/generateLabel'
import { InferSelectModel } from 'drizzle-orm'

const types = User.type.enumValues.map(x => ({
  label: generateLabel(x),
  value: x
}))

export const Render: FC<{
  data: {
    users: {
      id: string
      name?: string | null
      email: string
      type?: InferSelectModel<typeof User>['type']
      role?: {
        name: string
      } | null
      createdAt: Date
      updatedAt?: Date | null
    }[]
    total: number
  }
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
            accessorKey: 'type',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Type" />
            )
          },
          {
            accessorKey: 'role',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Role" />
            ),
            cell: ({ row }) => row.original.role?.name,
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
              row.original.updatedAt ? timesAgo(row.original.updatedAt) : null
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
        filterableColumns={[
          {
            id: 'type',
            title: 'Type',
            options: types
          }
        ]}
      />
    </Shell>
  )
}
