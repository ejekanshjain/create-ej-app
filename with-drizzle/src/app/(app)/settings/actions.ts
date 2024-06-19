'use server'

import { db } from '@/db'
import { User } from '@/db/schema'
import { getAuthSession } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export const updateName = async ({ name }: { name: string }) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  await db
    .update(User)
    .set({
      name
    })
    .where(eq(User.id, session.user.id))
}
