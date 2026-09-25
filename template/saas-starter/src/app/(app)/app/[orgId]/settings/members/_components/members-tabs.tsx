'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  RefreshCcw,
  Trash2,
  UserPlus,
  XCircle
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { organization } from '~/lib/auth-client'
import { formatDate } from '~/lib/format-date'
import { roleArticle, type AssignableRole } from '~/lib/rbac'
import { useSafeActionQuery } from '~/lib/safe-action-client'
import { toastActionError, toastSuccessMessage } from '~/lib/toast-message'
import { getInvitations, getMembers } from '../../../../../actions/members'
import { useOrganizationContext } from '../../../../_components/organization-context'
import { InviteMemberDialog } from './invite-member-dialog'

type Member = {
  id: string
  userId: string
  name: string
  email: string
  image: string | null
  role: string
  createdAt: Date
}

type Invitation = {
  id: string
  email: string
  role: string
  status: string
  expiresAt: Date | null
  createdAt: Date
  inviterName: string | null
}

const MEMBERS_QUERY_KEY = 'org-members'
const INVITATIONS_QUERY_KEY = 'org-invitations'

type PendingConfirm =
  | { kind: 'remove'; member: Member }
  | { kind: 'cancel'; invitation: Invitation }

function roleVariant(role: string): 'default' | 'secondary' | 'outline' {
  if (role === 'owner') return 'default'
  if (role === 'admin') return 'secondary'
  return 'outline'
}

function statusVariant(
  status: string
): 'success' | 'info' | 'secondary' | 'destructive' {
  if (status === 'accepted') return 'success'
  if (status === 'pending') return 'info'
  if (status === 'rejected') return 'destructive'
  return 'secondary'
}

function getInitials(name: string, email: string) {
  const source = (name || email || '').trim()
  if (!source) return '?'
  const parts = source.split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
}

const memberFilters: DataTableFilter[] = [
  {
    id: 'role',
    label: 'Role',
    options: [
      { label: 'Owner', value: 'owner' },
      { label: 'Admin', value: 'admin' },
      { label: 'Member', value: 'member' }
    ]
  }
]

const invitationFilters: DataTableFilter[] = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Accepted', value: 'accepted' },
      { label: 'Rejected', value: 'rejected' },
      { label: 'Canceled', value: 'canceled' }
    ]
  }
]

export function MembersTabs({
  memberCount,
  maxMembers
}: {
  memberCount: number
  maxMembers: number
}) {
  const {
    id: orgId,
    role: currentRole,
    memberId: currentMemberId
  } = useOrganizationContext()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null
  )

  const atMemberLimit = memberCount >= maxMembers

  const invalidateMembers = () =>
    queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] })
  const invalidateInvitations = () =>
    queryClient.invalidateQueries({ queryKey: [INVITATIONS_QUERY_KEY] })

  const [memberQuery, setMemberQuery] = useQueryStates(
    {
      mPage: parseAsInteger.withDefault(1),
      mLimit: parseAsInteger.withDefault(10),
      mSortBy: parseAsString,
      mSortOrder: parseAsString,
      mSearch: parseAsString,
      mFilters: parseAsJson(v => v as Record<string, (string | boolean)[]>)
    },
    { history: 'replace' }
  )

  const memberParams = {
    organizationId: orgId,
    page: memberQuery.mPage,
    limit: memberQuery.mLimit,
    sortBy: (memberQuery.mSortBy ?? undefined) as
      'name' | 'email' | 'role' | 'createdAt' | undefined,
    sortOrder: (memberQuery.mSortOrder ?? undefined) as
      SortOrderEnum | undefined,
    search: memberQuery.mSearch ?? undefined,
    filters: memberQuery.mFilters ?? undefined
  }

  const { data: memberData, isLoading: membersLoading } = useSafeActionQuery(
    MEMBERS_QUERY_KEY,
    getMembers,
    memberParams
  )

  async function changeRole(member: Member, role: AssignableRole) {
    setBusyId(member.id)
    const { error } = await organization.updateMemberRole({
      organizationId: orgId,
      memberId: member.id,
      role
    })
    setBusyId(null)
    if (error) {
      toastActionError(error, 'The role was not changed. Try again.')
      return
    }
    toastSuccessMessage(`${member.name} is now ${roleArticle(role)}`)
    invalidateMembers()
  }

  async function removeMember(member: Member) {
    setBusyId(member.id)
    const { error } = await organization.removeMember({
      organizationId: orgId,
      memberIdOrEmail: member.id
    })
    setBusyId(null)
    if (error) {
      toastActionError(error, 'The member was not removed. Try again.')
      return
    }
    setPendingConfirm(null)
    toastSuccessMessage(`${member.name} removed`)
    invalidateMembers()
    // Refresh the server component so the member-limit gate reflects the freed slot.
    router.refresh()
  }

  const memberColumns: DataTableColumnDef<Member>[] = [
    {
      accessorKey: 'name',
      header: 'Member',
      enableSorting: true,
      cell: ({ row }) => {
        const member = row.original
        const isSelf = member.id === currentMemberId
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {member.image ? (
                <AvatarImage src={member.image} alt={member.name} />
              ) : null}
              <AvatarFallback className="text-xs">
                {getInitials(member.name, member.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {member.name}
                {isSelf ? (
                  <span className="text-muted-foreground"> (you)</span>
                ) : null}
              </span>
              <span className="text-muted-foreground text-xs">
                {member.email}
              </span>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant={roleVariant(row.original.role)} className="capitalize">
          {row.original.role}
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
      cell: ({ row }) => {
        const member = row.original
        // Owners manage everyone; admins manage only members. Never self/owner.
        const canAct =
          member.role !== 'owner' &&
          member.id !== currentMemberId &&
          (currentRole === 'owner' || member.role === 'member')

        if (!canAct) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={busyId === member.id}
                aria-label="Member actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {member.role !== 'admin' ? (
                <DropdownMenuItem onClick={() => changeRole(member, 'admin')}>
                  Make Admin
                </DropdownMenuItem>
              ) : null}
              {member.role !== 'member' ? (
                <DropdownMenuItem onClick={() => changeRole(member, 'member')}>
                  Make Member
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setPendingConfirm({ kind: 'remove', member })}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const [inviteQuery, setInviteQuery] = useQueryStates(
    {
      iPage: parseAsInteger.withDefault(1),
      iLimit: parseAsInteger.withDefault(10),
      iSortBy: parseAsString,
      iSortOrder: parseAsString,
      iSearch: parseAsString,
      iFilters: parseAsJson(v => v as Record<string, (string | boolean)[]>)
    },
    { history: 'replace' }
  )

  const inviteParams = {
    organizationId: orgId,
    page: inviteQuery.iPage,
    limit: inviteQuery.iLimit,
    sortBy: (inviteQuery.iSortBy ?? undefined) as
      'email' | 'status' | 'createdAt' | 'expiresAt' | undefined,
    sortOrder: (inviteQuery.iSortOrder ?? undefined) as
      SortOrderEnum | undefined,
    search: inviteQuery.iSearch ?? undefined,
    filters: inviteQuery.iFilters ?? undefined
  }

  const { data: inviteData, isLoading: invitesLoading } = useSafeActionQuery(
    INVITATIONS_QUERY_KEY,
    getInvitations,
    inviteParams
  )

  async function resendInvitation(invitation: Invitation) {
    setBusyId(invitation.id)
    const { error } = await organization.inviteMember({
      organizationId: orgId,
      email: invitation.email,
      role: invitation.role === 'admin' ? 'admin' : 'member',
      resend: true
    })
    setBusyId(null)
    if (error) {
      toastActionError(error, 'The invitation was not resent. Try again.')
      return
    }
    toastSuccessMessage(`Invitation resent to ${invitation.email}`)
    invalidateInvitations()
  }

  async function cancelInvitation(invitation: Invitation) {
    setBusyId(invitation.id)
    const { error } = await organization.cancelInvitation({
      invitationId: invitation.id
    })
    setBusyId(null)
    if (error) {
      toastActionError(error, 'The invitation was not canceled. Try again.')
      return
    }
    setPendingConfirm(null)
    toastSuccessMessage('Invitation canceled')
    invalidateInvitations()
  }

  const invitationColumns: DataTableColumnDef<Invitation>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.email}</span>
          {row.original.inviterName ? (
            <span className="text-muted-foreground text-xs">
              Invited by {row.original.inviterName}
            </span>
          ) : null}
        </div>
      )
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={roleVariant(row.original.role)} className="capitalize">
          {row.original.role}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => {
        const expired =
          row.original.status === 'pending' &&
          row.original.expiresAt != null &&
          new Date(row.original.expiresAt).getTime() < Date.now()
        const status = expired ? 'expired' : row.original.status
        return (
          <Badge variant={statusVariant(status)} className="capitalize">
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'expiresAt',
      header: 'Expires',
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.expiresAt, { short: true })
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const invitation = row.original
        if (invitation.status !== 'pending') return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={busyId === invitation.id}
                aria-label="Invitation actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => resendInvitation(invitation)}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Resend
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  setPendingConfirm({ kind: 'cancel', invitation })
                }
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <Tabs defaultValue="members" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        {atMemberLimit ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button size="sm" disabled>
                  <UserPlus />
                  Invite Member
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Your plan allows {maxMembers} members and you have {memberCount}.
              Upgrade your plan to invite more.
            </TooltipContent>
          </Tooltip>
        ) : (
          <InviteMemberDialog onInvited={invalidateInvitations}>
            <Button size="sm">
              <UserPlus />
              Invite Member
            </Button>
          </InviteMemberDialog>
        )}
      </div>

      <TabsContent value="members">
        <DataTable
          columns={memberColumns}
          data={memberData?.[0]}
          isLoading={membersLoading}
          totalCount={memberData?.[1]}
          enableSearch
          initialSearch={memberParams.search}
          searchPlaceholder="Search members…"
          manualPagination
          manualSorting
          pageIndex={memberParams.page - 1}
          pageSize={memberParams.limit}
          filters={memberFilters}
          activeFilters={memberParams.filters ?? {}}
          onParamsChange={({
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            filters
          }) =>
            setMemberQuery({
              mPage: page,
              mLimit: limit,
              mSortBy: sortBy ?? null,
              mSortOrder: sortOrder ?? null,
              mSearch: search ?? null,
              mFilters: filters ?? null
            })
          }
        />
      </TabsContent>

      <TabsContent value="invitations">
        <DataTable
          columns={invitationColumns}
          data={inviteData?.[0]}
          isLoading={invitesLoading}
          totalCount={inviteData?.[1]}
          enableSearch
          initialSearch={inviteParams.search}
          searchPlaceholder="Search invitations…"
          manualPagination
          manualSorting
          pageIndex={inviteParams.page - 1}
          pageSize={inviteParams.limit}
          filters={invitationFilters}
          activeFilters={inviteParams.filters ?? {}}
          onParamsChange={({
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            filters
          }) =>
            setInviteQuery({
              iPage: page,
              iLimit: limit,
              iSortBy: sortBy ?? null,
              iSortOrder: sortOrder ?? null,
              iSearch: search ?? null,
              iFilters: filters ?? null
            })
          }
        />
      </TabsContent>

      <ConfirmDialog
        open={pendingConfirm !== null}
        onOpenChange={open => {
          if (!open) setPendingConfirm(null)
        }}
        title={
          pendingConfirm?.kind === 'remove'
            ? 'Remove Member'
            : 'Cancel Invitation'
        }
        description={
          pendingConfirm?.kind === 'remove'
            ? `${pendingConfirm.member.name} loses access to this organization.`
            : pendingConfirm?.kind === 'cancel'
              ? `The invitation link sent to ${pendingConfirm.invitation.email} stops working.`
              : ''
        }
        confirmLabel={
          pendingConfirm?.kind === 'remove'
            ? 'Remove Member'
            : 'Cancel Invitation'
        }
        pending={busyId !== null}
        onConfirm={() => {
          if (pendingConfirm?.kind === 'remove') {
            void removeMember(pendingConfirm.member)
          } else if (pendingConfirm?.kind === 'cancel') {
            void cancelInvitation(pendingConfirm.invitation)
          }
        }}
      />
    </Tabs>
  )
}
