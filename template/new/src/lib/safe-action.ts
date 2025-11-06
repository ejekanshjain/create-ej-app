import { createSafeActionClient } from 'next-safe-action'
import { getAuthSession } from './auth'

export const actionClient = createSafeActionClient().use(
  async ({ next, ctx }) => {
    const session = await getAuthSession()

    return next({
      ctx: {
        ...ctx,
        user: session?.user
      }
    })
  }
)
