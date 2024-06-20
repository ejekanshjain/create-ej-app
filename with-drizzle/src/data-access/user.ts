import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { User } from '@/db/schema'

type UpdateUserByIdInput = { name: string }

export const updateUserById = async (id: string, data: UpdateUserByIdInput) => {
  await db.update(User).set(data).where(eq(User.id, id))
}
