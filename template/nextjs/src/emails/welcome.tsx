import { Heading, Text } from 'react-email'
import EmailLayout from '~/emails/components/email-layout'
import { siteConfig } from '~/lib/siteConfig'

export interface WelcomeEmailProps {
  userName: string
  companyName: string
}

/** Sent once, right after an account is created. */
export default function WelcomeEmail({
  userName,
  companyName
}: WelcomeEmailProps) {
  return (
    <EmailLayout
      previewText={`Welcome to ${companyName}. Your account is ready.`}
      companyName={companyName}
    >
      <Heading className="mb-4 text-2xl font-bold text-gray-900">
        Welcome to {companyName}
      </Heading>

      <Text className="mb-4 text-base text-gray-700">Hi {userName},</Text>

      <Text className="mb-4 text-base text-gray-700">
        Your account is ready. Sign in any time with the email address this
        message was sent to.
      </Text>
    </EmailLayout>
  )
}

WelcomeEmail.PreviewProps = {
  userName: 'Alex Morgan',
  companyName: siteConfig.name
} satisfies WelcomeEmailProps
