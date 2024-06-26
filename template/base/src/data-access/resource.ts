import { db } from '@/db'
import { Resource } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

type createResourceInput = {
  id?: string
  filename: string
  key: string
  isTemp: boolean
  url: string
  size: number
  contentType: string
  createdById?: string | null

  taskId?: string | null
}

export const createResource = async (data: createResourceInput) => {
  const newResource = await db
    .insert(Resource)
    .values({
      ...data
    })
    .returning({
      id: Resource.id
    })

  const id = newResource[0]?.id

  if (!id) throw new Error('Failed to create resource')

  return id
}

export const getResourceById = async (id: string) => {
  return await db.query.Resource.findFirst({
    where: eq(Resource.id, id)
  })
}

type updateResourceInput = {
  id: string
  isTemp?: boolean
  contentType?: string
  size?: number
  updatedById?: string | null

  taskId?: string | null
}

export const updateResource = async (data: updateResourceInput) => {
  return await db
    .update(Resource)
    .set({
      ...data,
      updatedAt: sql`now()`
    })
    .where(eq(Resource.id, data.id))
}
