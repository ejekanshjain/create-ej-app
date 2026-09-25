'use server'

import { eq } from 'drizzle-orm'
import { db } from '~/db'
import { invitationsTable } from '~/db/schema'
import { actionClient, withWideEvent } from '~/lib/safe-action'
import { stringValidation } from '~/lib/validations'

/**
 * Public view of an invitation for the accept page. Invitation IDs are
 * unguessable, and accepting still requires signing in as the invited email.
 */
export const getInvitation = actionClient.inputSchema(stringValidation).action(
  withWideEvent('getInvitation', async ({ parsedInput: invitationId }) => {
    const invitation = await db.query.invitationsTable.findFirst({
      where: eq(invitationsTable.id, invitationId),
      columns: {
        id: true,
        status: true,
        expiresAt: true,
        email: true,
        role: true
      },
      with: {
        organization: { columns: { name: true } },
        inviter: { columns: { name: true } }
      }
    })

    return invitation ?? null
  })
)
