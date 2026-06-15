import { eq } from 'drizzle-orm'
import { Building2 } from 'lucide-react'
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
import { db } from '~/db'
import { invitationsTable } from '~/db/schema'
import { getAuthSession } from '~/lib/auth'
import {
  AcceptInvitationForm,
  WrongAccountActions
} from './accept-invitation-form'

export default async function AcceptInvitationPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const invitation = await db.query.invitationsTable.findFirst({
    where: eq(invitationsTable.id, id),
    with: {
      organization: {
        columns: {
          id: true,
          name: true
        }
      },
      user: {
        columns: {
          id: true,
          name: true
        }
      }
    },
    columns: {
      id: true,
      status: true,
      expiresAt: true,
      email: true,
      role: true
    }
  })

  if (!invitation || invitation.status !== 'pending') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>
              This invitation link is invalid or has already been used.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
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
            <CardTitle>Invitation expired</CardTitle>
            <CardDescription>
              This invitation to <strong>{invitation.organization.name}</strong>{' '}
              has expired. Ask your organization admin for a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
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
            <CardTitle>You&apos;ve been invited</CardTitle>
            <CardDescription>
              <strong>{invitation.user.name}</strong> invited you to join{' '}
              <strong>{invitation.organization.name}</strong>. Sign in to
              accept.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/login?callbackUrl=/accept-invitation/${id}`}>
                Sign in to accept
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
            <CardTitle>Wrong account</CardTitle>
            <CardDescription>
              This invitation was sent to <strong>{invitation.email}</strong>{' '}
              but you&apos;re signed in as{' '}
              <strong>{authSession.user.email}</strong>. Sign in with the
              correct account to accept.
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
            <strong>{invitation.user.name}</strong> has invited you to join{' '}
            <strong>{invitation.organization.name}</strong>
            {invitation.role ? ` as ${invitation.role}` : ''}.
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
