'use server'

import { assertUserMembership } from '~/lib/organization-access'
import { authActionClient } from '~/lib/safe-action'
import { generateUploadUrl, isR2Configured } from '~/lib/storage'
import { generateUploadUrlSchema } from './uploads.validation'

export const generateUploadUrlAction = authActionClient
  .inputSchema(generateUploadUrlSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (!isR2Configured()) {
      return { mode: 'base64' as const }
    }

    if (parsedInput.organizationId) {
      await assertUserMembership(parsedInput.organizationId)
    }

    const { uploadUrl, key } = await generateUploadUrl({
      filename: parsedInput.filename,
      mimeType: parsedInput.mimeType,
      size: parsedInput.size,
      uploadedBy: user.id,
      organizationId: parsedInput.organizationId
    })

    return { mode: 'r2' as const, uploadUrl, key }
  })
