'use server'

import { db } from '~/db'
import { feedbacksTable } from '~/db/schema'
import { assertMember } from '~/lib/organization-access'
import { authActionClient, withWideEvent } from '~/lib/safe-action'
import { createFeedbackSchema } from './feedbacks.validation'

/** Any member can rate the product from inside an organization. */
export const createFeedbackAction = authActionClient
  .inputSchema(createFeedbackSchema)
  .action(
    withWideEvent('createFeedbackAction', async ({ parsedInput, ctx }) => {
      await assertMember(parsedInput.organizationId, ctx.user.id)

      const [feedback] = await db
        .insert(feedbacksTable)
        .values({
          userId: ctx.user.id,
          organizationId: parsedInput.organizationId,
          rating: parsedInput.rating,
          comment: parsedInput.comment
        })
        .returning()

      return feedback
    })
  )
