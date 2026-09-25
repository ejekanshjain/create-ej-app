'use server'

import { assertCanManageOrganization } from '~/lib/organization-access'
import { authActionClient, withWideEvent } from '~/lib/safe-action'
import { generateUploadUrl, isR2Configured } from '~/lib/storage'
import { generateUploadUrlSchema } from './uploads.validation'

/**
 * Starts an upload for an organization the caller manages. Without R2 the
 * client falls back to a base64 data URL, which the saving action accepts
 * only while R2 stays unconfigured.
 */
export const generateUploadUrlAction = authActionClient
  .inputSchema(generateUploadUrlSchema)
  .action(
    withWideEvent(
      'generateUploadUrlAction',
      async ({ parsedInput, ctx: { user } }) => {
        await assertCanManageOrganization(parsedInput.organizationId, user.id)

        if (!isR2Configured()) {
          return { mode: 'base64' as const }
        }

        const { uploadUrl, key } = await generateUploadUrl({
          filename: parsedInput.filename,
          mimeType: parsedInput.mimeType,
          size: parsedInput.size,
          uploadedBy: user.id,
          organizationId: parsedInput.organizationId
        })

        return { mode: 'r2' as const, uploadUrl, key }
      }
    )
  )
