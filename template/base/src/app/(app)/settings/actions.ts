'use server'

import { authActionClient } from '@/lib/safe-action'
import { updateCurrentUserNameUseCase } from '@/use-case/user'
import { userSchema } from './validation'

export const updateNameAction = authActionClient
  .schema(userSchema)
  .action(async ({ parsedInput: { name }, ctx: { user } }) => {
    await updateCurrentUserNameUseCase(user.id, {
      name
    })

    return {
      success: true
    }
  })
