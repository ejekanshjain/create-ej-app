import { db } from '@/db'
import { Resource } from '@/db/schema'
import { eq, or, sql } from 'drizzle-orm'

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

type updateResourceByIdInput = {
  id: string
  isTemp?: boolean
  contentType?: string
  size?: number
  updatedById?: string | null

  taskId?: string | null
}

export const updateResourceById = async (data: updateResourceByIdInput) => {
  return await db
    .update(Resource)
    .set({
      ...data,
      updatedAt: sql`now()`
    })
    .where(eq(Resource.id, data.id))
}

type updateResourceByIdsInput = {
  ids: string[]
  taskId?: string | null
  updatedById?: string | null
}

export const updateResourceByIds = async (data: updateResourceByIdsInput) => {
  return await db
    .update(Resource)
    .set({
      ...data,
      updatedAt: sql`now()`
    })
    .where(or(...data.ids.map(id => eq(Resource.id, id))))
}

export const getResourcesByTaskId = async (taskId: string) => {
  return await db.query.Resource.findMany({
    where: eq(Resource.taskId, taskId)
  })
}

export const deleteResource = async (id: string) => {
  return await db.delete(Resource).where(eq(Resource.id, id))
}
