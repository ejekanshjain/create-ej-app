import { z } from 'zod'
import {
  imageUrlValidation,
  slugValidation,
  stringValidation
} from '~/lib/validations'

export const organizationDetailsSchema = z.object({
  name: stringValidation,
  slug: slugValidation
})

export const updateOrganizationSchema = organizationDetailsSchema.extend({
  organizationId: stringValidation,
  /** Empty string clears the logo. */
  logo: imageUrlValidation
})
