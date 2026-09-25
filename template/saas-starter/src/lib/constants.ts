/**
 * @fileoverview Application-wide constants for configuration and validation.
 *
 * Read limits, labels, and repeated values from here in the UI, validation,
 * tests, and docs, so one change updates every place.
 *
 * @module lib/constants
 */

// ============================================
// BILLING
// ============================================

/** Length of the free trial on paid plans that offer one */
export const TRIAL_DAYS = 7

// ============================================
// ORGANIZATIONS
// ============================================

/** Organizations one user can create */
export const MAX_ORGANIZATIONS_PER_USER = 10

/** Days an organization invitation stays valid */
export const INVITATION_EXPIRES_IN_DAYS = 7

// ============================================
// R2 STORAGE
// ============================================

/** Seconds the client has to complete a presigned upload */
export const PRESIGNED_URL_TTL_SECONDS = 900

/** Age after which an unconfirmed upload is deleted */
export const TEMP_CLEANUP_THRESHOLD_MS = 2 * 60 * 60 * 1000

/** Maximum upload size in MB */
export const MAX_FILE_SIZE_MB = 5

/** Maximum upload size in bytes */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

/** MIME types the upload flow accepts, mapped to the extension stored on the object key */
export const R2_UPLOAD_EXTENSION_BY_MIME_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
} as const

export type R2UploadMimeType = keyof typeof R2_UPLOAD_EXTENSION_BY_MIME_TYPE

// ============================================
// REQUEST ARRAY BOUNDS
// ============================================

/*
 * Ceilings for arrays that reach SQL as an `IN (…)` list. Postgres caps a
 * statement at 65535 bind parameters, and an unbounded array also builds in
 * server memory first.
 */

/** Values accepted in one list-filter array, such as status facets */
export const MAX_FILTER_VALUES = 100

// ============================================
// TEXT AND INTEGER INPUT BOUNDS
// ============================================

/**
 * Image value ceiling.
 * Covers R2 object keys and base64 data URLs for the max upload size.
 */
export const MAX_IMAGE_URL_LENGTH =
  Math.ceil(MAX_FILE_SIZE_BYTES * (4 / 3)) + 64

/** URL slug for organizations */
export const MAX_SLUG_LENGTH = 64

/** Feedback comments */
export const MAX_COMMENT_LENGTH = 3_000

/** Support ticket bodies and contact form messages */
export const MAX_MESSAGE_LENGTH = 5_000

/** Shortest contact form message worth answering */
export const MIN_CONTACT_MESSAGE_LENGTH = 10

/** Star ratings on feedback */
export const MIN_RATING = 1
export const MAX_RATING = 5
