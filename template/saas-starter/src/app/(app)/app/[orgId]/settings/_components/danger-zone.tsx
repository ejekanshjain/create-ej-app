'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { transferOrganizationOwnershipAction } from '~/app/(app)/actions/organization'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { organization } from '~/lib/auth-client'
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'

type TransferTarget = {
  memberId: string
  name: string
  email: string
  role: string
}

export function DangerZone({
  orgId,
  orgName,
  isOwner,
  transferTargets
}: {
  orgId: string
  orgName: string
  isOwner: boolean
  transferTargets: TransferTarget[]
}) {
  // The sole owner can't leave: ownership must first be handed to someone else.
  const isSoleOwner =
    isOwner && !transferTargets.some(target => target.role === 'owner')

  return (
    <section className="border-destructive/30 space-y-6 rounded-lg border p-6">
      <div>
        <h2 className="text-destructive text-lg font-semibold">Danger zone</h2>
        <p className="text-muted-foreground text-sm">
          These actions are irreversible. Proceed with care.
        </p>
      </div>

      {isOwner && transferTargets.length > 0 ? (
        <TransferOwnershipRow
          orgId={orgId}
          isOwner={isOwner}
          transferTargets={transferTargets}
        />
      ) : null}

      <LeaveOrganizationRow
        orgId={orgId}
        orgName={orgName}
        isSoleOwner={isSoleOwner}
      />

      {isOwner ? (
        <DeleteOrganizationRow orgId={orgId} orgName={orgName} />
      ) : null}
    </section>
  )
}

function Row({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function TransferOwnershipRow({
  orgId,
  isOwner,
  transferTargets
}: {
  orgId: string
  isOwner: boolean
  transferTargets: TransferTarget[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [targetId, setTargetId] = useState('')

  const transferOwnership = useSafeActionMutation(
    transferOrganizationOwnershipAction,
    {
      onSuccess: () => {
        toastSuccessMessage('Ownership transferred')
        setOpen(false)
        router.refresh()
      },
      onError: error => {
        toastErrorMessage(error.message ?? 'Failed to transfer ownership')
      }
    }
  )

  function handleTransfer() {
    if (!isOwner) {
      toastErrorMessage('Only the organization owner can transfer ownership.')
      return
    }
    if (!targetId) return

    transferOwnership.mutate({
      organizationId: orgId,
      targetMemberId: targetId
    })
  }

  return (
    <Row
      title="Transfer ownership"
      description="Make another member the owner. You'll become an admin."
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Transfer</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer ownership</DialogTitle>
            <DialogDescription>
              Select the member who should become the new owner. You&apos;ll be
              demoted to admin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-1">
            <Label>New owner</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {transferTargets.map(target => (
                  <SelectItem key={target.memberId} value={target.memberId}>
                    {target.name} ({target.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={transferOwnership.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={transferOwnership.isPending || !targetId}
            >
              {transferOwnership.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Transfer ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  )
}

function LeaveOrganizationRow({
  orgId,
  orgName,
  isSoleOwner
}: {
  orgId: string
  orgName: string
  isSoleOwner: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleLeave() {
    // Guard: the only owner must transfer ownership before leaving.
    if (isSoleOwner) {
      toastErrorMessage(
        'Transfer ownership to another member before leaving this organization.'
      )
      return
    }

    setSubmitting(true)
    const { error } = await organization.leave({ organizationId: orgId })

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to leave organization')
      setSubmitting(false)
      return
    }

    toastSuccessMessage(`You left ${orgName}`)
    router.push('/app')
  }

  return (
    <Row
      title="Leave organization"
      description="Remove yourself from this organization."
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Leave</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSoleOwner ? 'Transfer ownership first' : `Leave ${orgName}?`}
            </DialogTitle>
            <DialogDescription>
              {isSoleOwner
                ? "You're the only owner of this organization. Make another member the owner before you leave - or delete the organization instead."
                : "You'll lose access to this organization. An owner or admin will need to invite you back."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {isSoleOwner ? 'Close' : 'Cancel'}
            </Button>
            {!isSoleOwner ? (
              <Button
                variant="destructive"
                onClick={handleLeave}
                disabled={submitting}
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Leave organization
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  )
}

function DeleteOrganizationRow({
  orgId,
  orgName
}: {
  orgId: string
  orgName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleDelete() {
    setSubmitting(true)
    const { error } = await organization.delete({ organizationId: orgId })

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to delete organization')
      setSubmitting(false)
      return
    }

    toastSuccessMessage(`${orgName} deleted`)
    router.push('/app')
  }

  return (
    <Row
      title="Delete organization"
      description="Permanently delete this organization and all of its data."
    >
      <Dialog
        open={open}
        onOpenChange={next => {
          setOpen(next)
          if (!next) setConfirmText('')
        }}
      >
        <DialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {orgName}?</DialogTitle>
            <DialogDescription>
              This cannot be undone. All members, invitations and data for this
              organization will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-1">
            <Label>
              Type <span className="font-semibold">{orgName}</span> to confirm
            </Label>
            <Input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={orgName}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting || confirmText !== orgName}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>
  )
}
