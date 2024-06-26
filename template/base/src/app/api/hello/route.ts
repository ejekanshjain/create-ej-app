import { env } from '@/env.mjs'
import { s3Client } from '@/lib/s3Client'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('jefjsbg')

  const filename = 'test.txt'

  const req = await createPresignedPost(s3Client, {
    Bucket: env.S3_BUCKET,
    Key: filename,
    Expires: 3600,
    Fields: {
      foo: 'bar',
      'Content-Type': 'text/plain',
      'Content-Disposition': 'inline; filename="test.txt"',
      'X-Amz-Meta-': '12314kfzhfkvhgbk'
    }
  })

  console.log(req)

  return NextResponse.json({ message: 'Hello World' })
}
