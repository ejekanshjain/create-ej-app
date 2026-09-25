/**
 * Shared Zod fragments for action input and forms.
 *
 * Client-safe: no env, DB, or server-only imports, so forms can reuse the
 * exact schema their action validates with.
 */
import z from 'zod'
import {
  MAX_COMMENT_LENGTH,
  MAX_IMAGE_URL_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_RATING,
  MAX_SLUG_LENGTH,
  MIN_RATING
} from '~/lib/constants'
import { isStoredImageValue } from '~/lib/image-url'

/**
 * Phone number: 7 to 15 digits once separators are removed (E.164 maximum).
 * Allowed characters are digits, `+`, `-`, `()`, `.`, and spaces.
 */
export const phoneValidation = z
  .string()
  .trim()
  .max(20)
  .regex(/^[\d+\-().\s]+$/, 'Enter a valid phone number.')
  .refine(value => {
    const digits = value.replace(/\D/g, '').length
    return digits >= 7 && digits <= 15
  }, 'Enter a phone number with 7 to 15 digits.')

/** Email address, trimmed and lowercased. */
export const emailValidation = z.email().trim().toLowerCase()

/** Required short string, 1 to 255 characters after trimming. */
export const stringValidation = z.string().trim().min(1).max(255)

/** Optional short string (max 255). Empty string is allowed after trim. */
export const optionalStringValidation = z.string().trim().max(255).optional()

/** Required body for support tickets and similar messages. */
export const requiredMessageValidation = z
  .string()
  .trim()
  .min(1, 'Enter a message.')
  .max(MAX_MESSAGE_LENGTH)

/** Required feedback comment. */
export const requiredCommentValidation = z
  .string()
  .trim()
  .min(1, 'Write your feedback.')
  .max(MAX_COMMENT_LENGTH)

/** Star rating from 1 to 5. */
export const ratingValidation = z.number().int().min(MIN_RATING).max(MAX_RATING)

/**
 * R2 object key or `data:image/*;base64,...` URL. Empty after trim is allowed
 * so a cleared field still parses; the action treats it as "no image".
 */
export const imageUrlValidation = z
  .string()
  .trim()
  .max(MAX_IMAGE_URL_LENGTH)
  .refine(value => value === '' || isStoredImageValue(value), {
    message: 'Upload an image file. External URLs are not stored.'
  })

/**
 * URL slug: lowercase letters, numbers, and single hyphens between segments.
 * Rejects empty strings, path segments, and query characters.
 */
export const slugValidation = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter a slug.')
  .max(MAX_SLUG_LENGTH)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use only lowercase letters, numbers, and hyphens.'
  )

/**
 * Build a URL slug from a display name.
 * Returns an empty string when nothing remains, such as an emoji-only name.
 */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, MAX_SLUG_LENGTH)
}
