import { z } from 'zod'
import { emailValidation, stringValidation } from '~/lib/validations'

/** The roles assignable to a platform user. */
export const userRoles = ['superadmin', 'admin', 'user'] as const

export type UserRole = (typeof userRoles)[number]

/**
 * Admin user form. Only superadmins reach it, and they may assign any role,
 * including promoting a user to `superadmin`.
 */
export const baseUserFormSchema = z.object({
  name: stringValidation,
  email: emailValidation,
  role: z.enum(userRoles)
})

export const createUserSchema = baseUserFormSchema

export const updateUserSchema = baseUserFormSchema.extend({
  id: stringValidation
})
