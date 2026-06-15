'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { organization, signOut } from '~/lib/auth-client'

export function AcceptInvitationForm({
  invitationId,
  organizationName
}: {
  invitationId: string
  organizationName: string
}) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)

  async function handleAccept() {
    setAccepting(true)
    const { error } = await organization.acceptInvitation({ invitationId })
    if (error) {
      toast.error(error.message ?? 'Failed to accept invitation')
      setAccepting(false)
      return
    }
    toast.success(`You've joined ${organizationName}`)
    router.push('/app')
  }

  async function handleDecline() {
    setDeclining(true)
    const { error } = await organization.rejectInvitation({ invitationId })
    if (error) {
      toast.error(error.message ?? 'Failed to decline invitation')
      setDeclining(false)
      return
    }
    toast('Invitation declined')
    router.push('/')
  }

  const disabled = accepting || declining

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={handleAccept} disabled={disabled} className="w-full">
        {accepting ? 'Accepting...' : 'Accept invitation'}
      </Button>
      <Button
        onClick={handleDecline}
        disabled={disabled}
        variant="outline"
        className="w-full"
      >
        {declining ? 'Declining...' : 'Decline'}
      </Button>
    </div>
  )
}

export function WrongAccountActions({
  invitationId
}: {
  invitationId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSwitch() {
    setLoading(true)
    await signOut()
    router.push(`/login?callbackUrl=/accept-invitation/${invitationId}`)
  }

  return (
    <div className="flex justify-center gap-3">
      <Button asChild variant="outline">
        <Link href="/">Return home</Link>
      </Button>
      <Button onClick={handleSwitch} disabled={loading}>
        {loading ? 'Signing out...' : 'Switch account'}
      </Button>
    </div>
  )
}
