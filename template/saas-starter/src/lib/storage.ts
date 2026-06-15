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
  TEMP_CLEANUP_THRESHOLD_MS
} from './constants'

/*
R2 Policy need to be set
[
  {
    "AllowedOrigins": [
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "PUT"
    ],
    "AllowedHeaders": [
      "content-type",
      "content-length"
    ]
  }
]
*/

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

function getR2Client(): S3Client {
  if (_r2Client) return _r2Client

  const configured = isR2Configured()
  if (!configured) {
    throw new Error('R2 storage is not configured')
  }

  _r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!
    }
  })

  return _r2Client
}

export async function deleteFile(key: string): Promise<void> {
  const client = getR2Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key
    })
  )

  await db.delete(fileUploadsTable).where(eq(fileUploadsTable.key, key))
}

export async function generateUploadUrl(params: {
  filename: string
  mimeType: string
  size: number
  uploadedBy: string
  organizationId?: string | null
}): Promise<{
  uploadUrl: string
  key: string
}> {
  const ext = params.filename.split('.').pop()?.toLowerCase() ?? 'bin'
  const folder = params.organizationId
    ? `uploads/organizations/${params.organizationId}`
    : `uploads/misc`

  const fileId = createId()
  const key = `${folder}/${fileId}.${ext}`

  const client = getR2Client()
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: params.mimeType,
      ContentLength: params.size
    }),
    { expiresIn: PRESIGNED_URL_TTL_SECONDS }
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

export async function confirmUpload(
  newKey: string,
  oldKey?: string | null
): Promise<void> {
  await db
    .update(fileUploadsTable)
    .set({ isTemp: false })
    .where(eq(fileUploadsTable.key, newKey))

  if (oldKey && isR2Configured()) {
    await deleteFile(oldKey).catch(() => {
      // Non-fatal: old file cleanup failure should not block the save
    })
  }
}

export function isR2Key(value: string | null | undefined): value is string {
  return !!value && !value.startsWith('data:') && !value.startsWith('https://')
}

export function resolveImageUrl(
  value: string | null | undefined
): string | null {
  if (!value) return null
  if (!isR2Key(value)) return value
  if (!isR2Configured()) return null
  return `${env.R2_PUBLIC_URL}/${value}`
}

export async function cleanupTempUploads(): Promise<{
  deleted: number
  errors: number
}> {
  const threshold = new Date(Date.now() - TEMP_CLEANUP_THRESHOLD_MS)

  const stale = await db
    .select({ id: fileUploadsTable.id, key: fileUploadsTable.key })
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
