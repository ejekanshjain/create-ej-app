import { z } from 'zod'
import {
  ratingValidation,
  requiredCommentValidation,
  stringValidation
} from '~/lib/validations'

export const createFeedbackSchema = z.object({
  organizationId: stringValidation,
  rating: ratingValidation,
  comment: requiredCommentValidation
})
