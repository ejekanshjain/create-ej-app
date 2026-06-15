import { z } from 'zod'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '~/lib/constants'
import { stringValidation } from '~/lib/validations'

export const generateUploadUrlSchema = z.object({
  filename: stringValidation,
  mimeType: stringValidation,
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, `File must be under ${MAX_FILE_SIZE_MB}MB`),
  organizationId: stringValidation
})
