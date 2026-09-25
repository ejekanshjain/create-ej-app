'use server'

import { db } from '~/db'
import { contactLeadsTable } from '~/db/schema'
import { actionClient, withWideEvent } from '~/lib/safe-action'
import { contactFormSchema } from './validation'

/** Public contact form. Submissions appear under Contact Leads in the admin panel. */
export const submitContactForm = actionClient
  .inputSchema(contactFormSchema)
  .action(
    withWideEvent('submitContactForm', async ({ parsedInput }) => {
      await db.insert(contactLeadsTable).values({
        name: parsedInput.name,
        email: parsedInput.email,
        phone: parsedInput.phone || null,
        subject: parsedInput.subject,
        message: parsedInput.message
      })

      return true
    })
  )
