import { z } from 'zod'
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  R2_UPLOAD_EXTENSION_BY_MIME_TYPE,
  type R2UploadMimeType
} from '~/lib/constants'
import { stringValidation } from '~/lib/validations'

const R2_UPLOAD_MIME_TYPES = Object.keys(R2_UPLOAD_EXTENSION_BY_MIME_TYPE) as [
  R2UploadMimeType,
  ...R2UploadMimeType[]
]

export const generateUploadUrlSchema = z.object({
  filename: stringValidation,
  mimeType: z.enum(R2_UPLOAD_MIME_TYPES),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, `Choose a file under ${MAX_FILE_SIZE_MB} MB.`),
  organizationId: stringValidation
})
