import { render, toPlainText } from '@react-email/render'
import TestEmail from '~/emails/test'
import { sendEmail } from '~/lib/nodemailer'

async function main() {
  const html = await render(
    TestEmail({
      name: 'Ekansh Jain'
    }),
    {
      pretty: true
    }
  )

  const text = toPlainText(html)

  const result = await sendEmail({
    to: 'john@example.com',
    subject: 'Test Email',
    text,
    html
  })

  console.info('Test email sent successfully', result)

  process.exit()
}

main()
