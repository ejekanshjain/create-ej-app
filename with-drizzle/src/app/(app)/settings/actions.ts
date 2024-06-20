'use server'

import { authActionClient } from '@/lib/safe-action'
import { updateUserNameUseCase } from '@/use-case/user'
import { userSchema } from './validation'

export const updateNameAction = authActionClient
  .schema(userSchema)
  .action(async ({ parsedInput: { name }, ctx: { user } }) => {
    await updateUserNameUseCase(user.id, {
      name
    })

    return {
      success: true
    }
  })
