import { createSafeActionClient } from 'next-safe-action'
import { getAuthSession } from './auth'

export const actionClient = createSafeActionClient()

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getAuthSession()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return next({
    ctx: {
      user: session.user
    }
  })
})

export const rootActionClient = actionClient.use(async ({ next }) => {
  const session = await getAuthSession()

  if (session?.user.type === 'Root') {
    return next({
      ctx: {
        user: session.user
      }
    })
  }

  throw new Error('Unauthorized')
})
