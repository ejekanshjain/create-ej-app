import type { Metadata } from 'next'
import { siteConfig } from '~/lib/siteConfig'
import { ContactEmailLink, LegalPage, LegalSection } from '../legal'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms that apply when you use ${siteConfig.name}.`
}

// Starting point only. Have this reviewed before you launch, and update it
// with `siteConfig.legal.lastUpdated` whenever the product's behavior changes.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms apply when you use {siteConfig.name}. By creating an
        account, you agree to them.
      </p>

      <LegalSection title="1. Your Account">
        <p>
          Keep access to your email inbox secure: anyone who can read it can
          sign in as you.
        </p>
      </LegalSection>

      <LegalSection title="2. Contact">
        <p>
          Email <ContactEmailLink /> with questions about these terms.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
