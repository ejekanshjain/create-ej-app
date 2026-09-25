/**
 * @fileoverview Shared email shell: a brand rule and name at the top, the
 * content, and a copyright footer. Every template wraps its body in it.
 *
 * @module emails/components/email-layout
 */

import {
  Body,
  Container,
  Head,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text
} from 'react-email'

/** Brand color. Email clients strip CSS variables, so it is a literal here. */
const BRAND = '#171717'

interface EmailLayoutProps {
  /** Text email clients show in the inbox before the email is opened. */
  previewText: string
  companyName: string
  children: React.ReactNode
}

export default function EmailLayout({
  previewText,
  companyName,
  children
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: { colors: { brand: BRAND } } }
        }}
      >
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-lg bg-white shadow-sm">
            <Section
              className="rounded-t-lg bg-white px-8 py-5"
              style={{
                borderTop: `4px solid ${BRAND}`,
                borderBottom: '1px solid #E5E7EB'
              }}
            >
              <Text className="m-0 text-lg font-bold tracking-tight text-gray-900">
                {companyName}
              </Text>
            </Section>

            <Section className="px-8 py-6">{children}</Section>

            <Section
              className="rounded-b-lg bg-gray-50 px-8 py-6"
              style={{ borderTop: '1px solid #E5E7EB' }}
            >
              <Text className="m-0 text-center text-sm text-gray-500">
                &copy; {new Date().getUTCFullYear()} {companyName}. All rights
                reserved.
              </Text>
              <Text className="m-0 mt-2 text-center text-xs text-gray-400">
                This is an automated email. Replies to this address are not
                read.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
