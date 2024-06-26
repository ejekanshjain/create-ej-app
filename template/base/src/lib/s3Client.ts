import {
  HeadObjectCommand,
  HeadObjectCommandOutput,
  S3Client
} from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { createId } from '@paralleldrive/cuid2'
import { extname } from 'path'

import {
  createResource,
  getResourceById,
  updateResource
} from '@/data-access/resource'
import { env } from '@/env.mjs'
import { CurrentUser } from './currentUser'

export const S3_HOST = `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com`

export const s3Client = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY
  }
})

export const getUrl = (key: string) => `${S3_HOST}/${key}`

const uploadLimit = 1024 * 1024 * 10 // 10 MB

export const getPresignedUrl = async ({
  filename,
  contentType,
  contentTypeStartsWith,
  isPublic,
  createdById
}: {
  filename: string
  contentType?: string
  contentTypeStartsWith?: string
  isPublic?: boolean
  createdById?: string | null
}) => {
  if (!contentType && !contentTypeStartsWith)
    throw new Error('"contentType" or "contentTypeStartsWith" is required')

  const id = createId()

  const extension = extname(filename)

  const key = `${id}${extension}`

  const url = getUrl(key)

  await createResource({
    id,
    filename,
    key,
    isTemp: true,
    url,
    createdById,
    size: 0,
    contentType: ''
  })

  const Conditions: any[] = [
    ['content-length-range', 1024, uploadLimit],
    { bucket: env.S3_BUCKET },
    { key }
  ]

  if (isPublic) Conditions.push({ acl: 'public-read' })
  if (contentType) Conditions.push(['eq', '$Content-Type', contentType])
  if (contentTypeStartsWith)
    Conditions.push(['starts-with', '$Content-Type', contentTypeStartsWith])

  const presigned = await createPresignedPost(s3Client, {
    Bucket: env.S3_BUCKET,
    Key: key,
    Expires: 300,
    Conditions,
    Fields: {
      ...(isPublic
        ? {
            acl: 'public-read'
          }
        : {}),
      metadata: JSON.stringify({
        id,
        filename,
        extension,
        createdById
      })
    }
    // ContentDisposition: `filename="${filename}"`
  })

  return {
    id,
    key,
    url,
    presigned
  }
}

export const markFileUploaded = async (
  currentUser: CurrentUser,
  id: string
) => {
  const resource = await getResourceById(id)

  if (!resource) throw new Error('Resource not found')

  let response: HeadObjectCommandOutput
  try {
    response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: resource.key
      })
    )
  } catch (err) {
    throw new Error('File not found')
  }

  await updateResource({
    id: resource.id,
    isTemp: false,
    contentType: response.ContentType,
    size: response.ContentLength,
    updatedById: currentUser.id
  })
}
