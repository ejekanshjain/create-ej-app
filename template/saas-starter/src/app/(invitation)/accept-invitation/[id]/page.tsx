import { Building2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { getAuthSession } from '~/lib/auth'
import { roleArticle } from '~/lib/rbac'
import { privatePageRobots } from '~/lib/seo'
import { getInvitation } from '../../actions/invitations'
import {
  AcceptInvitationForm,
  WrongAccountActions
} from './accept-invitation-form'

export const metadata: Metadata = {
  title: 'Accept Invitation',
  robots: privatePageRobots
}

export default async function AcceptInvitationPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const invitation = (await getInvitation(id))?.data

  if (!invitation || invitation.status !== 'pending') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              This invitation link is invalid or was already used. Ask the
              organization admin to send a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation to <strong>{invitation.organization.name}</strong>{' '}
              expired. Ask the organization admin to send a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  const authSession = await getAuthSession()

  if (!authSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Building2 className="text-primary size-6" />
            </div>
            <CardTitle>You&apos;re Invited</CardTitle>
            <CardDescription>
              <strong>{invitation.inviter.name}</strong> invited you to join{' '}
              <strong>{invitation.organization.name}</strong>. Sign in to
              accept.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/accept-invitation/${id}`)}`}
              >
                Sign In to Accept
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (authSession.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Wrong Account</CardTitle>
            <CardDescription>
              This invitation was sent to <strong>{invitation.email}</strong>{' '}
              but you&apos;re signed in as{' '}
              <strong>{authSession.user.email}</strong>. Switch accounts to
              accept it.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <WrongAccountActions invitationId={id} />
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Building2 className="text-primary size-6" />
          </div>
          <CardTitle>Join {invitation.organization.name}</CardTitle>
          <CardDescription>
            <strong>{invitation.inviter.name}</strong> invited you to join{' '}
            <strong>{invitation.organization.name}</strong>
            {invitation.role ? ` as ${roleArticle(invitation.role)}` : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AcceptInvitationForm
            invitationId={id}
            organizationName={invitation.organization.name}
          />
        </CardContent>
      </Card>
    </main>
  )
}
