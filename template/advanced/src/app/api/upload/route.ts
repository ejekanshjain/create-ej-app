import { GCPStorageClient } from '@ejekanshjain/cloud-storage'
import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/env.mjs'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const storageClient = GCPStorageClient({
  projectId: env.FIREBASE_PROJECT_ID!,
  privateKey: env.FIREBASE_PRIVATE_KEY!,
  clientEmail: env.FIREBASE_CLIENT_EMAIL!,
  bucket: env.FIREBASE_STORAGE_BUCKET!,
  defaultMediaPublic: true
})

export async function POST(request: NextRequest) {
  const session = await getAuthSession()
  if (!session)
    return NextResponse.json({
      success: false
    })

  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) return NextResponse.json({ success: false })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filename = `${Date.now()}-${Math.random()}-${file.name}`
  const url = await storageClient.addFile({
    filename,
    data: buffer
  })
  const { id } = await prisma.resource.create({
    data: {
      newFilename: filename,
      originalFilename: file.name,
      url
    }
  })

  return NextResponse.json({ success: true, id, url })
}
