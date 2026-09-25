import { Button, Heading, Text } from 'react-email'
import EmailLayout from '~/emails/components/email-layout'
import { siteConfig } from '~/lib/siteConfig'

export interface MagicLinkEmailProps {
  magicLink: string
  companyName: string
}

/** Passwordless sign-in link. The link works once and expires in 5 minutes. */
export default function MagicLinkEmail({
  magicLink,
  companyName
}: MagicLinkEmailProps) {
  return (
    <EmailLayout
      previewText={`Your link to sign in to ${companyName}`}
      companyName={companyName}
    >
      <Heading className="mb-4 text-2xl font-bold text-gray-900">
        Sign In to {companyName}
      </Heading>

      <Text className="mb-4 text-base text-gray-700">
        Select the button below to sign in. The link expires in 5 minutes.
      </Text>

      <Button
        href={magicLink}
        className="bg-brand mb-4 rounded-lg px-6 py-3 text-center text-base font-semibold text-white no-underline"
      >
        Sign In
      </Button>

      <Text className="mb-4 text-sm text-gray-600">
        Or copy this link into your browser:
      </Text>

      <Text className="text-brand mb-4 text-sm break-all">{magicLink}</Text>

      <Text className="text-sm text-gray-500">
        If you didn&apos;t ask to sign in, you can ignore this email.
      </Text>
    </EmailLayout>
  )
}

MagicLinkEmail.PreviewProps = {
  magicLink: 'https://example.com/magic-link?token=your_magic_link_token_here',
  companyName: siteConfig.name
} satisfies MagicLinkEmailProps
