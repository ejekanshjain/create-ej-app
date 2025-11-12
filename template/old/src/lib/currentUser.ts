import { User } from '@/db/schema'
import { InferSelectModel } from 'drizzle-orm'

export type CurrentUser = {
  id: string
  type: InferSelectModel<typeof User>['type']
  roleId?: string | null
}
