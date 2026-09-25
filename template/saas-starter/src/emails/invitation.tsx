import { Button, Heading, Text } from 'react-email'
import EmailLayout from '~/emails/components/email-layout'
import { INVITATION_EXPIRES_IN_DAYS } from '~/lib/constants'
import { roleArticle } from '~/lib/rbac'
import { siteConfig } from '~/lib/siteConfig'

export interface InvitationEmailProps {
  inviteUrl: string
  organizationName: string
  inviterName: string
  role: string
  companyName: string
}

/** Invitation to join an organization, sent by the Better Auth organization plugin. */
export default function InvitationEmail({
  inviteUrl,
  organizationName,
  inviterName,
  role,
  companyName
}: InvitationEmailProps) {
  return (
    <EmailLayout
      previewText={`${inviterName} invited you to join ${organizationName}`}
      companyName={companyName}
    >
      <Heading className="mb-4 text-2xl font-bold text-gray-900">
        You&apos;re Invited to Join {organizationName}
      </Heading>

      <Text className="mb-4 text-base text-gray-700">
        {inviterName} invited you to join <strong>{organizationName}</strong> on{' '}
        {companyName} as {roleArticle(role)}.
      </Text>

      <Text className="mb-4 text-base text-gray-700">
        Select the button below to accept. You&apos;ll sign in with this email
        address first.
      </Text>

      <Button
        href={inviteUrl}
        className="bg-brand mb-4 rounded-lg px-6 py-3 text-center text-base font-semibold text-white no-underline"
      >
        Accept Invitation
      </Button>

      <Text className="mb-4 text-sm text-gray-600">
        Or copy this link into your browser:
      </Text>

      <Text className="text-brand mb-4 text-sm break-all">{inviteUrl}</Text>

      <Text className="text-sm text-gray-500">
        This invitation expires in {INVITATION_EXPIRES_IN_DAYS} days. If you
        weren&apos;t expecting it, you can ignore this email.
      </Text>
    </EmailLayout>
  )
}

InvitationEmail.PreviewProps = {
  inviteUrl: 'https://example.com/accept-invitation/your_invitation_id_here',
  organizationName: 'Acme Inc.',
  inviterName: 'Alex Morgan',
  role: 'member',
  companyName: siteConfig.name
} satisfies InvitationEmailProps
