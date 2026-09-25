import 'server-only'

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createId } from '@paralleldrive/cuid2'
import { and, eq, lt } from 'drizzle-orm'
import { db } from '~/db'
import { fileUploadsTable } from '~/db/schema'
import { env } from '~/env'
import {
  PRESIGNED_URL_TTL_SECONDS,
  R2_UPLOAD_EXTENSION_BY_MIME_TYPE,
  TEMP_CLEANUP_THRESHOLD_MS,
  type R2UploadMimeType
} from './constants'
import { AppError, AppErrorCode } from './errors'
import {
  canPersistImageValue,
  isDataImageUrl,
  isR2ObjectKey
} from './image-url'

/*
The R2 bucket needs this CORS policy for browser uploads:
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type", "content-length"]
  }
]
*/

/** True when all five R2 env vars are set. When false, uploads fall back to base64 data URLs. */
export function isR2Configured(): boolean {
  return !!(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME &&
    env.R2_PUBLIC_URL
  )
}

let _r2Client: S3Client | null = null

/**
 * `requestChecksumCalculation: 'WHEN_REQUIRED'` avoids signing
 * `x-amz-checksum-crc32=AAAAAA==` (empty body) into presigned PUTs, which
 * breaks non-empty uploads on backends that validate the header.
 */
function getR2Client(): S3Client {
  if (_r2Client) return _r2Client

  if (!isR2Configured()) {
    // A configuration bug, not a customer error: masked and recorded.
    throw new Error('R2 storage is not configured.')
  }

  _r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
  })

  return _r2Client
}

/**
 * Throws unless `key` sits under `uploads/organizations/<organizationId>/` and
 * has a `file_uploads` row recorded for that same organization.
 *
 * Call this on any R2 key that comes from user input before it is persisted,
 * confirmed, or deleted, so a request can never reference another tenant's
 * object.
 */
export async function assertOwnedR2Key(
  key: string,
  organizationId: string
): Promise<void> {
  if (!key.startsWith(`uploads/organizations/${organizationId}/`)) {
    throw new AppError(
      AppErrorCode.FORBIDDEN,
      'You do not have permission to use this file.'
    )
  }

  const exists = await db.query.fileUploadsTable.findFirst({
    where: and(
      eq(fileUploadsTable.key, key),
      eq(fileUploadsTable.organizationId, organizationId)
    ),
    columns: { id: true }
  })

  if (!exists) {
    throw new AppError(
      AppErrorCode.FORBIDDEN,
      'You do not have permission to use this file.'
    )
  }
}

/**
 * Deletes a file from R2 and removes its tracking row.
 *
 * Trusted-caller primitive with no ownership check. Validate a key that came
 * from user input with {@link assertOwnedR2Key} first.
 */
export async function deleteFile(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key })
  )

  await db.delete(fileUploadsTable).where(eq(fileUploadsTable.key, key))
}

/**
 * Presigns a PUT for a direct browser-to-R2 upload and records it as
 * temporary. Content-Type is signed, so the browser cannot upload `text/html`
 * under an image key.
 *
 * The browser PUTs the file to `uploadUrl`, then the action that saves the
 * resource calls {@link confirmUpload} with the returned `key`.
 */
export async function generateUploadUrl(params: {
  filename: string
  mimeType: R2UploadMimeType
  size: number
  uploadedBy: string
  organizationId: string
}): Promise<{ uploadUrl: string; key: string }> {
  const ext = R2_UPLOAD_EXTENSION_BY_MIME_TYPE[params.mimeType]
  const fileId = createId()
  const key = `uploads/organizations/${params.organizationId}/${fileId}.${ext}`

  const uploadUrl = await getSignedUrl(
    getR2Client(),
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: params.mimeType,
      ContentLength: params.size
    }),
    {
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
      signableHeaders: new Set(['content-type'])
    }
  )

  await db.insert(fileUploadsTable).values({
    id: `file_upload_${fileId}`,
    key,
    originalName: params.filename,
    mimeType: params.mimeType,
    size: params.size,
    isTemp: true,
    uploadedBy: params.uploadedBy,
    organizationId: params.organizationId
  })

  return { uploadUrl, key }
}

/**
 * Marks an upload permanent and deletes the file it replaces.
 *
 * Call it in the action that saves the resource. `newKey` must belong to
 * `organizationId`, and this throws otherwise. Deleting `oldKey` is
 * best-effort and never blocks the save.
 */
export async function confirmUpload(
  newKey: string,
  organizationId: string,
  oldKey?: string | null
): Promise<void> {
  await assertOwnedR2Key(newKey, organizationId)

  await db
    .update(fileUploadsTable)
    .set({ isTemp: false })
    .where(eq(fileUploadsTable.key, newKey))

  if (oldKey && oldKey !== newKey)
    await deleteOwnedFileQuietly(oldKey, organizationId)
}

/**
 * Deletes a replaced or cleared file when `organizationId` owns it. Failures
 * are swallowed: a stale object costs storage, not correctness.
 */
export async function deleteOwnedFileQuietly(
  key: string,
  organizationId: string
): Promise<void> {
  if (!isR2Key(key) || !isR2Configured()) return

  const owned = await assertOwnedR2Key(key, organizationId)
    .then(() => true)
    .catch(() => false)

  if (owned) await deleteFile(key).catch(() => {})
}

/**
 * Deletes every upload an organization owns, from R2 and the database.
 * `file_uploads.organization_id` restricts deletes, so the organization row
 * can only go once this has run.
 */
export async function deleteOrganizationUploads(
  organizationId: string
): Promise<void> {
  const uploads = await db
    .select({ key: fileUploadsTable.key })
    .from(fileUploadsTable)
    .where(eq(fileUploadsTable.organizationId, organizationId))

  if (isR2Configured()) {
    for (const upload of uploads) {
      await deleteFile(upload.key)
    }
  }

  await db
    .delete(fileUploadsTable)
    .where(eq(fileUploadsTable.organizationId, organizationId))
}

/** True when `value` is an R2 object key (`uploads/organizations/<id>/<file>.<ext>`). */
export function isR2Key(value: string | null | undefined): value is string {
  return !!value && isR2ObjectKey(value)
}

/**
 * Rejects image values that must not be written to a resource. This blocks
 * `data:` URLs when R2 is configured. Ownership stays in {@link assertOwnedR2Key}.
 */
export function assertPersistableImageValue(
  value: string | null | undefined
): void {
  if (!value) return
  if (canPersistImageValue(value, isR2Configured())) return
  throw new AppError(
    AppErrorCode.BAD_REQUEST,
    'Upload an image file. Embedded images are not stored.'
  )
}

/**
 * Resolves a stored image value to a renderable URL.
 *
 * - R2 object key: prefixed with `R2_PUBLIC_URL`
 * - `data:image/*;base64,...` (dev without R2): returned as-is
 * - anything else, including `https://` and `javascript:`: `null`
 */
export function resolveImageUrl(
  value: string | null | undefined
): string | null {
  if (!value) return null
  if (isR2ObjectKey(value)) {
    if (!isR2Configured()) return null
    return `${env.R2_PUBLIC_URL}/${value}`
  }
  if (isDataImageUrl(value)) return value
  return null
}

/**
 * Deletes temporary uploads older than {@link TEMP_CLEANUP_THRESHOLD_MS}.
 * Per-file errors are counted, not thrown, so one failure cannot abort the
 * batch. `bun run storage:cleanup` runs it; schedule that command.
 */
export async function cleanupTempUploads(): Promise<{
  deleted: number
  errors: number
}> {
  const threshold = new Date(Date.now() - TEMP_CLEANUP_THRESHOLD_MS)

  const stale = await db
    .select({ key: fileUploadsTable.key })
    .from(fileUploadsTable)
    .where(
      and(
        eq(fileUploadsTable.isTemp, true),
        lt(fileUploadsTable.createdAt, threshold)
      )
    )

  let deleted = 0
  let errors = 0

  for (const file of stale) {
    try {
      await deleteFile(file.key)
      deleted++
    } catch {
      errors++
    }
  }

  return { deleted, errors }
}
