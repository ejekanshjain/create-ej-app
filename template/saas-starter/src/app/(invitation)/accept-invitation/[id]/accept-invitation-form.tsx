'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { organization, signOut } from '~/lib/auth-client'
import {
  toastActionError,
  toastInfoMessage,
  toastSuccessMessage
} from '~/lib/toast-message'

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
      toastActionError(error, 'The invitation was not accepted. Try again.')
      setAccepting(false)
      return
    }
    toastSuccessMessage(`You joined ${organizationName}`)
    router.push('/app')
  }

  async function handleDecline() {
    setDeclining(true)
    const { error } = await organization.rejectInvitation({ invitationId })
    if (error) {
      toastActionError(error, 'The invitation was not declined. Try again.')
      setDeclining(false)
      return
    }
    toastInfoMessage('Invitation declined')
    router.push('/')
  }

  const disabled = accepting || declining

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={handleAccept} disabled={disabled} className="w-full">
        {accepting ? 'Accepting…' : 'Accept Invitation'}
      </Button>
      <Button
        onClick={handleDecline}
        disabled={disabled}
        variant="outline"
        className="w-full"
      >
        {declining ? 'Declining…' : 'Decline'}
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
    router.push(
      `/login?callbackUrl=${encodeURIComponent(`/accept-invitation/${invitationId}`)}`
    )
  }

  return (
    <div className="flex justify-center gap-3">
      <Button asChild variant="outline">
        <Link href="/">Go Home</Link>
      </Button>
      <Button onClick={handleSwitch} disabled={loading}>
        {loading ? 'Signing out…' : 'Switch Account'}
      </Button>
    </div>
  )
}
