'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  Ban,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
  UserCog,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates
} from 'nuqs'
import { useState } from 'react'
import { ConfirmDialog } from '~/components/confirm-dialog'
import { DataTable, type DataTableColumnDef } from '~/components/data-table'
import { SortOrderEnum } from '~/components/data-table/enum'
import { DataTableFilter } from '~/components/data-table/types'
import { PageHeading } from '~/components/page-heading'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { admin, useSession } from '~/lib/auth-client'
import { formatDate } from '~/lib/format-date'
import { useSafeActionQuery } from '~/lib/safe-action-client'
import {
  toastActionError,
  toastErrorMessage,
  toastSuccessMessage
} from '~/lib/toast-message'
import { getDistinctRoles, getUsers } from '../../../actions/users'

type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: string | null
  banned: boolean | null
  createdAt: Date
  updatedAt: Date
}

type PendingConfirm = { kind: 'ban' | 'unban' | 'delete'; user: User }

const CONFIRM_COPY = {
  ban: {
    title: 'Ban User',
    description: 'They are signed out and can no longer sign in.',
    confirmLabel: 'Ban User',
    success: 'User banned'
  },
  unban: {
    title: 'Unban User',
    description: 'They can sign in again.',
    confirmLabel: 'Unban User',
    success: 'User unbanned'
  },
  delete: {
    title: 'Delete User',
    description:
      'This permanently deletes the account and removes it from every organization.',
    confirmLabel: 'Delete User',
    success: 'User deleted'
  }
} as const

function UserActionsCell({
  user,
  isSelf,
  onConfirm
}: {
  user: User
  isSelf: boolean
  onConfirm: (pending: PendingConfirm) => void
}) {
  const router = useRouter()
  const [isImpersonating, setIsImpersonating] = useState(false)

  const handleImpersonate = async () => {
    setIsImpersonating(true)
    const { error } = await admin.impersonateUser({ userId: user.id })
    if (error) {
      toastActionError(error, 'Impersonation did not start. Try again.')
      setIsImpersonating(false)
      return
    }
    router.push('/app')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="User actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/settings/users/${user.id}`}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Link>
        </DropdownMenuItem>
        {isSelf ? null : (
          <>
            <DropdownMenuItem
              disabled={isImpersonating}
              onClick={handleImpersonate}
            >
              <UserCog className="mr-2 h-4 w-4" /> Impersonate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onConfirm({ kind: user.banned ? 'unban' : 'ban', user })
              }
            >
              <Ban className="mr-2 h-4 w-4" />
              {user.banned ? 'Unban User' : 'Ban User'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onConfirm({ kind: 'delete', user })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const filters: DataTableFilter[] = [
  {
    id: 'role',
    label: 'Role',
    action: getDistinctRoles,
    queryKey: 'admin-distinct-roles'
  },
  {
    id: 'banned',
    label: 'Status',
    options: [
      { label: 'Active', value: false },
      { label: 'Banned', value: true }
    ]
  }
]

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null
  )
  const [isConfirming, setIsConfirming] = useState(false)

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
      'name' | 'email' | 'createdAt' | undefined,
    sortOrder: (queryState.sortOrder ?? undefined) as SortOrderEnum | undefined,
    search: queryState.search ?? undefined,
    filters: queryState.filters ?? undefined
  }

  const { data, isLoading } = useSafeActionQuery(
    'admin-users',
    getUsers,
    params
  )

  async function runConfirmedAction({ kind, user }: PendingConfirm) {
    setIsConfirming(true)
    try {
      const { error } =
        kind === 'delete'
          ? await admin.removeUser({ userId: user.id })
          : kind === 'ban'
            ? await admin.banUser({ userId: user.id })
            : await admin.unbanUser({ userId: user.id })

      if (error) {
        toastActionError(error, 'That change was not saved. Try again.')
        return
      }

      toastSuccessMessage(CONFIRM_COPY[kind].success)
      setPendingConfirm(null)
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } catch {
      toastErrorMessage('That change was not saved. Try again.')
    } finally {
      setIsConfirming(false)
    }
  }

  const columns: DataTableColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      enableSorting: true,
      cell: ({ row }) => (
        <Link
          href={`/admin/settings/users/${row.original.id}`}
          className="group/user-link flex items-center gap-3"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium group-hover/user-link:underline">
              {row.original.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {row.original.email}
            </span>
          </div>
        </Link>
      )
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.role ?? 'user'}
        </Badge>
      )
    },
    {
      accessorKey: 'banned',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.banned ? 'destructive' : 'success'}>
          {row.original.banned ? 'Banned' : 'Active'}
        </Badge>
      )
    },
    {
      accessorKey: 'emailVerified',
      header: 'Verified',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.emailVerified ? 'success' : 'secondary'}>
          {row.original.emailVerified ? 'Verified' : 'Unverified'}
        </Badge>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.createdAt, { short: true })
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <UserActionsCell
          user={row.original}
          isSelf={row.original.id === session?.user.id}
          onConfirm={setPendingConfirm}
        />
      )
    }
  ]

  const confirmCopy = pendingConfirm ? CONFIRM_COPY[pendingConfirm.kind] : null

  return (
    <div className="space-y-6">
      <PageHeading
        title="Users"
        description="Create accounts, assign roles, and ban or delete users."
        icon={Users}
      >
        <Button size="lg" asChild>
          <Link href="/admin/settings/users/new">
            <Plus /> New User
          </Link>
        </Button>
      </PageHeading>

      <DataTable
        columns={columns}
        data={data?.[0]}
        isLoading={isLoading}
        totalCount={data?.[1]}
        enableSearch
        initialSearch={params.search}
        searchPlaceholder="Search users…"
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

      <ConfirmDialog
        open={pendingConfirm !== null}
        onOpenChange={open => {
          if (!open) setPendingConfirm(null)
        }}
        title={confirmCopy?.title ?? ''}
        description={
          <>
            <span className="text-foreground font-medium">
              {pendingConfirm?.user.email}
            </span>
            : {confirmCopy?.description}
          </>
        }
        confirmLabel={confirmCopy?.confirmLabel ?? ''}
        destructive={pendingConfirm?.kind !== 'unban'}
        pending={isConfirming}
        onConfirm={() => pendingConfirm && runConfirmedAction(pendingConfirm)}
      />
    </div>
  )
}
