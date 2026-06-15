'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import {
  Ban,
  Edit,
  MoreHorizontal,
  Plus,
  Shield,
  Trash2,
  UserCog,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates
} from 'nuqs'
import { useState } from 'react'
import { DataTable } from '~/components/data-table'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { admin } from '~/lib/auth-client'
import { formatDate } from '~/lib/format-date'
import { useSafeActionQuery } from '~/lib/safe-action-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'
import { getDistinctRoles, getUsers } from '../../../../actions/users'
import { CreateUserDialog } from './create-user-dialog'
import { EditNameDialog } from './edit-name-dialog'

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

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const ADMIN_ROLES = new Set(['admin', 'superadmin'])

function UserActionsCell({
  user,
  isSuperAdmin,
  currentUserId
}: {
  user: User
  isSuperAdmin: boolean
  currentUserId: string
}) {
  const isSelf = user.id === currentUserId
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const canImpersonate = isSuperAdmin
    ? user.role !== 'superadmin'
    : !ADMIN_ROLES.has(user.role ?? '')

  async function handleImpersonate() {
    setIsLoading(true)
    try {
      await admin.impersonateUser({ userId: user.id })
      router.push('/app')
    } catch {
      toastErrorMessage('Failed to impersonate user')
      setIsLoading(false)
    }
  }

  async function handleToggleBan() {
    const confirmed = window.confirm(
      user.banned
        ? 'Unban this user?'
        : 'Ban this user? They will no longer be able to sign in.'
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      const action = user.banned ? admin.unbanUser : admin.banUser
      const { error } = await action({ userId: user.id })

      if (error) {
        toastErrorMessage(
          error.message ?? (user.banned ? 'Failed to unban' : 'Failed to ban')
        )
      } else {
        toastSuccessMessage(user.banned ? 'User unbanned' : 'User banned')
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Delete this user? This action cannot be undone.'
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      const { error } = await admin.removeUser({ userId: user.id })

      if (error) {
        toastErrorMessage(error.message ?? 'Failed to delete user')
      } else {
        toastSuccessMessage('User deleted')
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSetRole(role: string) {
    setIsLoading(true)
    try {
      const { error } = await admin.setRole({
        userId: user.id,
        role: role as any
      })

      if (error) {
        toastErrorMessage(error.message ?? 'Failed to update role')
      } else {
        toastSuccessMessage('Role updated')
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      }
    } finally {
      setIsLoading(false)
    }
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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-muted-foreground max-w-44 truncate text-xs font-normal">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <EditNameDialog userId={user.id} currentName={user.name}>
          <DropdownMenuItem onSelect={e => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit name
          </DropdownMenuItem>
        </EditNameDialog>

        {canImpersonate && !isSelf && (
          <DropdownMenuItem disabled={isLoading} onClick={handleImpersonate}>
            <UserCog className="mr-2 h-4 w-4" />
            Impersonate
          </DropdownMenuItem>
        )}

        {!isSelf && (isSuperAdmin || user.role !== 'superadmin') && (
          <DropdownMenuItem disabled={isLoading} onClick={handleToggleBan}>
            <Ban className="mr-2 h-4 w-4" />
            {user.banned ? 'Unban user' : 'Ban user'}
          </DropdownMenuItem>
        )}

        {isSuperAdmin && !isSelf && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isLoading}>
              <Shield className="mr-2 h-4 w-4" />
              Set role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {(['user', 'admin', 'superadmin'] as const).map(role => (
                <DropdownMenuItem
                  key={role}
                  disabled={user.role === role || isLoading}
                  onClick={() => handleSetRole(role)}
                  className="capitalize"
                >
                  {role}
                  {user.role === role && (
                    <span className="text-muted-foreground ml-auto text-xs">
                      current
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {isSuperAdmin && !isSelf && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete user
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

interface UsersTableProps {
  isSuperAdmin: boolean
  currentUserId: string
}

export function UsersTable({ isSuperAdmin, currentUserId }: UsersTableProps) {
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
      | 'name'
      | 'email'
      | 'createdAt'
      | undefined,
    sortOrder: (queryState.sortOrder ?? undefined) as SortOrderEnum | undefined,
    search: queryState.search ?? undefined,
    filters: queryState.filters ?? undefined
  }

  const { data, isLoading } = useSafeActionQuery(
    'admin-users',
    getUsers,
    params
  )

  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.original.name}</span>
            <span className="text-muted-foreground text-xs">
              {row.original.email}
            </span>
          </div>
        </div>
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
        <Badge variant={row.original.banned ? 'destructive' : 'default'}>
          {row.original.banned ? 'Banned' : 'Active'}
        </Badge>
      )
    },
    {
      accessorKey: 'emailVerified',
      header: 'Verified',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.emailVerified ? 'default' : 'secondary'}>
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
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <UserActionsCell
          user={row.original}
          isSuperAdmin={isSuperAdmin}
          currentUserId={currentUserId}
        />
      )
    }
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <PageHeading
        title="Users"
        description="Manage users and their roles."
        icon={Users}
      >
        {isSuperAdmin && (
          <CreateUserDialog>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New user
            </Button>
          </CreateUserDialog>
        )}
      </PageHeading>

      <DataTable
        columns={columns}
        data={data?.[0]}
        isLoading={isLoading}
        totalCount={data?.[1]}
        enableSearch
        initialSearch={params.search}
        searchPlaceholder="Search users..."
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
