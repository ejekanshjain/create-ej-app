'use server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const updateName = async ({ name }: { name: string }) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  await prisma.user.update({
    where: {
      id: session.user.id
    },
    data: {
      name
    }
  })
}
