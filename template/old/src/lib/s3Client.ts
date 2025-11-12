import {
  DeleteObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  S3Client
} from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { createId } from '@paralleldrive/cuid2'
import { extname } from 'path'

import {
  createResource,
  deleteResource,
  getResourceById,
  updateResourceById
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
  contentType: string
  contentTypeStartsWith?: string
  isPublic?: boolean
  createdById?: string | null
}) => {
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
    contentType
  })

  const Conditions: any[] = [
    ['content-length-range', 1024, uploadLimit],
    { bucket: env.S3_BUCKET },
    { key },
    ['eq', '$Content-Type', contentType],
    ['eq', '$x-amz-meta-filename', filename],
    ['eq', '$x-amz-meta-extension', extension]
  ]

  if (isPublic) Conditions.push({ acl: 'public-read' })
  if (contentTypeStartsWith)
    Conditions.push(['starts-with', '$Content-Type', contentTypeStartsWith])
  if (createdById)
    Conditions.push(['eq', '$x-amz-meta-createdById', createdById])

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

      ...(createdById
        ? {
            'X-Amz-Meta-createdById': createdById
          }
        : {}),

      'X-Amz-Meta-filename': filename,
      'X-Amz-Meta-extension': extension,
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`
    }
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

  await updateResourceById({
    id: resource.id,
    isTemp: false,
    contentType: response.ContentType,
    size: response.ContentLength,
    updatedById: currentUser.id
  })
}

export const deleteFile = async (id: string) => {
  const resource = await getResourceById(id)

  if (!resource) throw new Error('Resource not found')

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: resource.key
    })
  )

  await deleteResource(id)
}
