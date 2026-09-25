import { z } from 'zod'
import { MAX_MESSAGE_LENGTH, MIN_CONTACT_MESSAGE_LENGTH } from '~/lib/constants'
import {
  emailValidation,
  phoneValidation,
  stringValidation
} from '~/lib/validations'

export const contactFormSchema = z.object({
  name: stringValidation,
  email: emailValidation,
  phone: phoneValidation.or(z.literal('')).optional(),
  subject: stringValidation,
  message: z
    .string()
    .trim()
    .min(
      MIN_CONTACT_MESSAGE_LENGTH,
      `Write at least ${MIN_CONTACT_MESSAGE_LENGTH} characters.`
    )
    .max(MAX_MESSAGE_LENGTH)
})
