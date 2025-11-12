import { z } from 'zod'

import { User } from '@/db/schema'

export const UserTypeEnumArr = User.type.enumValues

export const UserCreateUpdateSchema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email().toLowerCase().trim(),
  type: z.enum(UserTypeEnumArr),
  roleId: z.string().optional().nullable()
})

export const UserUpdateServerSchema = UserCreateUpdateSchema.merge(
  z.object({
    id: z.string().min(1)
  })
)
