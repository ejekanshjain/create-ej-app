/**
 * Image field formats stored on organizations.
 *
 * Client-safe: no env, DB, or server-only imports. Zod schemas and
 * `resolveImageUrl` share these predicates so only R2 keys and data image
 * URLs reach the renderer.
 */
import {
  R2_UPLOAD_EXTENSION_BY_MIME_TYPE,
  type R2UploadMimeType
} from '~/lib/constants'

const IMAGE_EXTENSIONS = Object.values(R2_UPLOAD_EXTENSION_BY_MIME_TYPE)
const IMAGE_SUBTYPES = (
  Object.keys(R2_UPLOAD_EXTENSION_BY_MIME_TYPE) as R2UploadMimeType[]
).map(mime => mime.slice('image/'.length))

const R2_OBJECT_KEY_RE = new RegExp(
  `^uploads/organizations/[a-z0-9_-]+/[a-zA-Z0-9._-]+\\.(${IMAGE_EXTENSIONS.join('|')})$`
)
const DATA_IMAGE_URL_RE = new RegExp(
  `^data:image/(?:${IMAGE_SUBTYPES.join('|')});base64,[A-Za-z0-9+/]+={0,2}$`
)

/** True when `value` is an owned-upload key (`uploads/organizations/<id>/<file>.<ext>`). */
export function isR2ObjectKey(value: string): boolean {
  return R2_OBJECT_KEY_RE.test(value)
}

/** True when `value` is a `data:image/*;base64,...` URL of an allowed MIME type. */
export function isDataImageUrl(value: string): boolean {
  return DATA_IMAGE_URL_RE.test(value)
}

/** True when `value` is an R2 object key or a data image URL. */
export function isStoredImageValue(value: string): boolean {
  return isR2ObjectKey(value) || isDataImageUrl(value)
}

/**
 * Persist rules after format checks.
 *
 * R2 keys are always eligible (ownership is a separate DB check). Data URLs
 * are only eligible when R2 is off; otherwise they skip the upload tracking
 * and inline megabytes into every page that shows the image.
 */
export function canPersistImageValue(
  value: string,
  r2Configured: boolean
): boolean {
  if (isR2ObjectKey(value)) return true
  if (isDataImageUrl(value)) return !r2Configured
  return false
}
