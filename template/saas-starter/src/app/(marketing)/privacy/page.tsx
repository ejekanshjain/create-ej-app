import type { Metadata } from 'next'
import { siteConfig } from '~/lib/siteConfig'
import {
  ContactEmailLink,
  ContactLink,
  LegalList,
  LegalPage,
  LegalSection
} from '../legal'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} collects, uses, and protects your data.`
}

// Starting point only. Have this reviewed before you launch, and update it
// with `siteConfig.legal.lastUpdated` whenever the product's data use changes.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what {siteConfig.name} collects, why, and what you
        can do about it.
      </p>

      <LegalSection title="1. Information You Give Us">
        <LegalList>
          <li>
            <strong>Account details</strong>: your name and email address. When
            you sign in with Google or GitHub, that provider also shares your
            profile picture.
          </li>
          <li>
            <strong>Organization details</strong>: organization names, logos,
            members, and invitations.
          </li>
          <li>
            <strong>Messages</strong>: support tickets, feedback, and contact
            form submissions.
          </li>
          <li>
            <strong>Billing</strong>: a billing email. Stripe processes card
            details; we never store them.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="2. How We Use It">
        <p>
          We use this information to run your account, send the emails you ask
          for, answer support requests, and bill paid plans.
        </p>
      </LegalSection>

      <LegalSection title="3. Contact">
        <p>
          Email <ContactEmailLink /> or <ContactLink /> with questions about
          your data.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
