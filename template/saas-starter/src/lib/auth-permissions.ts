import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements } from 'better-auth/plugins/admin/access'

const statement = {
  ...defaultStatements
} as const

export const ac = createAccessControl(statement)

const user = ac.newRole({})

const admin = ac.newRole({
  user: ['list', 'ban', 'impersonate', 'set-password', 'get', 'update'],
  session: defaultStatements.session
})

const superadmin = ac.newRole({
  user: defaultStatements.user,
  session: defaultStatements.session
})

export const roles = { user, admin, superadmin }
