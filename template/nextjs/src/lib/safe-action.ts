import 'server-only'

import { createSafeActionClient } from 'next-safe-action'
import { getAuthSession } from './auth'
import { AppError, AppErrorCode, isAppError } from './errors'
import { flattenForWideEvent, recordError, recordWideEvent } from './otel'

/** Shown for every unexpected error; details stay in telemetry. */
export const UNEXPECTED_ERROR_MESSAGE =
  'The request did not finish. Try again in a few minutes.'

type ActionServerArgs = {
  parsedInput?: unknown
  clientInput?: unknown
  [key: string]: unknown
}

/**
 * Wrap a safe-action server function with wide-event telemetry.
 *
 * Records `action.name`, flattened `parsedInput` (or `clientInput`), and on
 * success `outcome: 'success'` plus `duration_ms`. Failures keep error fields
 * from `handleServerError`; duration is still recorded.
 *
 * @example
 * export const myAction = authActionClient
 *   .inputSchema(schema)
 *   .action(
 *     withWideEvent('myAction', async ({ parsedInput, ctx }) => {
 *       // business logic only
 *     })
 *   )
 */
export function withWideEvent<TArgs extends ActionServerArgs, TResult>(
  actionName: string,
  serverCode: (args: TArgs) => Promise<TResult>
): (args: TArgs) => Promise<TResult> {
  return async args => {
    const startedAt = Date.now()
    const input = args.parsedInput ?? args.clientInput

    recordWideEvent({
      'action.name': actionName,
      ...flattenForWideEvent(input, 'input')
    })

    try {
      const result = await serverCode(args)
      recordWideEvent({
        outcome: 'success',
        duration_ms: Date.now() - startedAt
      })
      return result
    } catch (error) {
      recordWideEvent({
        outcome: 'error',
        duration_ms: Date.now() - startedAt
      })
      throw error
    }
  }
}

/**
 * Configured safe action client with authentication middleware
 * This client wraps server actions with:
 * - Automatic input/output validation using Zod
 * - Type-safe error handling ({@link AppError} messages reach the client)
 * - Server-side authentication injection
 *
 * All server actions using this client automatically receive the current auth session
 * in the context, so protected actions can access user information.
 *
 * @example
 * export const myAction = actionClient
 *   .inputSchema(z.object({ name: z.string() }))
 *   .action(async ({ parsedInput: { name }, ctx }) => {
 *     const userId = ctx.user?.id // Auth injected automatically
 *     return { success: true }
 *   })
 */
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (isAppError(e)) {
      recordWideEvent({
        'error.name': e.name,
        'error.code': e.code,
        'error.message': e.message,
        'error.expected': true,
        outcome: 'error'
      })
      return e.message
    }

    recordError(e)
    recordWideEvent({
      'error.name': e.name,
      'error.expected': false,
      'error.message': e.message,
      outcome: 'error'
    })
    return UNEXPECTED_ERROR_MESSAGE
  }
}).use(async ({ next, ctx }) => {
  // Retrieve current authentication session
  const authSession = await getAuthSession()

  // Record user information in telemetry for all actions, if available
  if (authSession) {
    recordWideEvent({
      'user.id': authSession.user.id,
      'user.admin': authSession.isAdmin,
      'user.superAdmin': authSession.isSuperAdmin,
      'session.id': authSession.session.id
    })
  }

  // Inject auth session into action context for all downstream actions
  return next({
    ctx: {
      ...ctx,
      ...authSession
    }
  })
})

export const authActionClient = actionClient.use(async ({ ctx, next }) => {
  if (!ctx?.user || !ctx?.session) {
    throw new AppError(AppErrorCode.UNAUTHORIZED, 'Sign in to continue.')
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session
    }
  })
})

/**
 * Action client for the admin panel.
 *
 * Allows both `admin` and `superadmin` roles. Use for actions that any
 * admin-panel user may run, such as reading customer data.
 */
export const adminActionClient = authActionClient.use(async ({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new AppError(
      AppErrorCode.FORBIDDEN,
      'You do not have permission to do this.'
    )
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session
    }
  })
})

/**
 * Action client restricted to the `superadmin` role.
 *
 * Use for privileged operations, such as user management, role changes, and
 * impersonation, that `admin` users cannot perform.
 */
export const superAdminActionClient = adminActionClient.use(
  async ({ ctx, next }) => {
    if (!ctx.isSuperAdmin) {
      throw new AppError(
        AppErrorCode.FORBIDDEN,
        'You do not have permission to do this.'
      )
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        session: ctx.session
      }
    })
  }
)
