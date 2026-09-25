import { Button, Heading, Text } from 'react-email'
import EmailLayout from '~/emails/components/email-layout'
import { siteConfig } from '~/lib/siteConfig'

interface TestEmailProps {
  name: string
}

/** Sent by `bun run email:test` to check SMTP settings. */
export default function TestEmail({ name }: TestEmailProps) {
  return (
    <EmailLayout
      previewText="Test email from your app"
      companyName={siteConfig.name}
    >
      <Heading className="mb-4 text-2xl font-bold text-gray-900">
        Test Email for {name}
      </Heading>
      <Text className="mb-6 text-base text-gray-700">
        Your SMTP settings work: this email reached your inbox.
      </Text>
      <Button
        href="https://example.com"
        className="bg-brand rounded-md px-5 py-3 text-center text-sm font-medium text-white"
      >
        Test Button
      </Button>
    </EmailLayout>
  )
}

TestEmail.PreviewProps = {
  name: 'Alex Morgan'
} satisfies TestEmailProps
