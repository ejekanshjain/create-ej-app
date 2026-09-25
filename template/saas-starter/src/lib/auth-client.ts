'use client'

/**
 * Browser auth client. The admin plugin gets the same access control as the
 * server so `admin.hasPermission` checks agree on both sides.
 */
import {
  adminClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from './auth'
import { ac, roles } from './auth-permissions'

export const {
  signIn,
  signOut,
  useSession,
  updateUser,
  getLastUsedLoginMethod,
  admin,
  organization
} = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    magicLinkClient(),
    adminClient({ ac, roles }),
    organizationClient(),
    lastLoginMethodClient()
  ]
})
