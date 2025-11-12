import { z } from 'zod'

import { RolePermission } from '@/db/schema'
import { generateLabel } from '@/lib/generateLabel'

const RolePermissionsEnumArr = RolePermission.permission.enumValues

export const RoleCreateUpdateSchema = z.object({
  name: z.string().min(1).trim(),
  permissions: z.array(z.enum(RolePermissionsEnumArr))
})

export const defaultPermissions = RolePermissionsEnumArr.map(x => ({
  label: generateLabel(x),
  value: x
}))

export const RoleUpdateServerSchema = RoleCreateUpdateSchema.merge(
  z.object({
    id: z.string().min(1)
  })
)
