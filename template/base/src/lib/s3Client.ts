import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createId } from '@paralleldrive/cuid2'
import { Readable } from 'stream'

import { db } from '@/db'
import { Resource } from '@/db/schema'
import { env } from '@/env.mjs'

const HOST = `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com`

export const s3Client = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY
  }
})

export const getUrl = (key: string) => `${HOST}/${key}`

type uploadFileS3Input = {
  filename: string
  body: string | Uint8Array | Buffer | Readable
  isPublic?: boolean
  isTemp?: boolean
  createdById?: string
}

export const uploadFile = async (input: uploadFileS3Input) => {
  const id = createId()

  const key = `${id}_${input.filename}`

  const response = await s3Client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: input.body,
      ContentDisposition: `filename="${input.filename}"`,
      Metadata: {
        id,
        filename: input.filename
      },
      ACL: input.isPublic ? 'public-read' : undefined
    })
  )

  const url = getUrl(key)

  return {
    id,
    url,
    key,
    response
  }
}

export const getPresignedUrl = async ({
  filename,
  isPublic
}: {
  filename: string
  isPublic?: boolean
}) => {
  const id = createId()

  const key = `${id}_${filename}`

  const url = getUrl(key)

  const r = await db.insert(Resource).values({
    id,
    filename,
    key,
    isTemp: true,
    url
  })

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentDisposition: `filename="${filename}"`,
    Metadata: {
      id,
      filename
    },
    ACL: isPublic ? 'public-read' : undefined
  })

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300
  })

  return {
    id,
    key,
    url,
    signedUrl
  }
}

// export const uploadFileS3 = async (input: uploadFileS3Input) => {
//   const ogFilename = filename
//   const randomId = randomUUID()
//   filename = randomId + '_' + filename

//   let ContentType
//   if (filename.endsWith('.pdf')) ContentType = 'application/pdf'
//   if (filename.endsWith('.png')) ContentType = 'image/png'
//   if (filename.endsWith('.jpg')) ContentType = 'image/jpeg'
//   if (filename.endsWith('.jpeg')) ContentType = 'image/jpeg'
//   if (filename.endsWith('.gif')) ContentType = 'image/gif'

//   const response = await s3Client.send(
//     new PutObjectCommand({
//       Bucket: env.AWS_BUCKET,
//       Key: filename,
//       Body: body,
//       ContentType,
//       ContentDisposition: `filename="${ogFilename}"`,
//       Metadata: {
//         originalFilename: ogFilename
//       }
//     })
//   )
//   const url = getUrl(filename)
//   const cdnUrl = env.AWS_CDN ? `${env.AWS_CDN}/${filename}` : undefined
//   const ResourceRepo = dataSource.getRepository(Resource)
//   const resource = await ResourceRepo.save(
//     ResourceRepo.create({
//       id: randomId,
//       filename,
//       url,
//       cdnUrl,
//       source,
//       isTemp,
//       createdById: creatorId,
//       updatedById: creatorId
//     })
//   )

//   return {
//     url,
//     cdnUrl,
//     filename,
//     resource,
//     response
//   }
// }

// export const deleteFileS3 = async (id: string) => {
//   if (!id) return
//   return await dataSource.transaction(async manager => {
//     const ResourceRepo = manager.getRepository(Resource)
//     const resource = await ResourceRepo.findOne({
//       where: { id },
//       select: { id: true, filename: true }
//     })
//     if (!resource) return
//     const Key = resource.filename
//     await ResourceRepo.delete({
//       id: resource.id
//     })
//     const response = await s3Client.send(
//       new DeleteObjectCommand({
//         Bucket: env.AWS_BUCKET,
//         Key
//       })
//     )
//     return {
//       response
//     }
//   })
// }
