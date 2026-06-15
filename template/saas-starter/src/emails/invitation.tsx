import { Button, Heading, Text } from 'react-email'
import EmailLayout from './components/email-layout'

export interface InvitationEmailProps {
  inviterName: string
  organizationName: string
  inviteLink: string
  companyName: string
}

export default function InvitationEmail({
  inviterName,
  organizationName,
  inviteLink,
  companyName
}: InvitationEmailProps) {
  const previewText = `${inviterName} invited you to join ${organizationName}`

  return (
    <EmailLayout previewText={previewText} companyName={companyName}>
      <Heading className="mb-4 text-2xl font-bold text-gray-900">
        You've been invited to join {organizationName}
      </Heading>

      <Text className="mb-4 text-base text-gray-700">
        <strong>{inviterName}</strong> has invited you to collaborate in{' '}
        <strong>{organizationName}</strong> on {companyName}.
      </Text>

      <Button
        href={inviteLink}
        className="mb-4 rounded-lg bg-black px-6 py-3 text-center text-base font-semibold text-white no-underline"
      >
        Accept Invitation
      </Button>

      <Text className="mb-4 text-sm text-gray-600">
        Or copy and paste this link into your browser:
      </Text>

      <Text className="mb-4 text-sm break-all text-blue-600">{inviteLink}</Text>

      <Text className="text-sm text-gray-500">
        If you weren't expecting this invitation, you can safely ignore this
        email.
      </Text>
    </EmailLayout>
  )
}

InvitationEmail.PreviewProps = {
  inviterName: 'John Doe',
  organizationName: 'Acme Inc',
  inviteLink: 'https://example.com/accept-invitation/abc123',
  companyName: 'Example Site'
} satisfies InvitationEmailProps
