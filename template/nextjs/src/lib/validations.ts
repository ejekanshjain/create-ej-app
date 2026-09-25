/**
 * Shared Zod fragments for action input and forms.
 *
 * Client-safe: no env, DB, or server-only imports, so forms can reuse the
 * exact schema their action validates with.
 */
import z from 'zod'

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
