/**
 * @fileoverview Sends one test email to check SMTP settings.
 *
 * @example
 * ```bash
 * bun run email:test you@example.com
 * ```
 */

import { render, toPlainText } from '@react-email/render'
import TestEmail from '~/emails/test'
import { sendEmail } from '~/lib/nodemailer'

async function sendTestMail(to: string) {
  const html = await render(TestEmail({ name: to }), { pretty: true })

  const result = await sendEmail({
    to,
    subject: 'Test Email',
    text: toPlainText(html),
    html
  })

  console.info('Test email sent', result)
}

if (import.meta.main) {
  const to = process.argv[2]

  if (!to) {
    console.error(
      'Pass a recipient address: bun run email:test you@example.com'
    )
    process.exit(1)
  }

  sendTestMail(to)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error sending test mail:', err)
      process.exit(1)
    })
}
