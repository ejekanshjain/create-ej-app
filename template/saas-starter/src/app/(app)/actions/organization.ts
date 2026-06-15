'use server'

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { membersTable, organizationsTable } from '~/db/schema'
import {
  assertUserCanManageOrganization,
  getUserMembershipCached
} from '~/lib/organization-access'
import { authActionClient } from '~/lib/safe-action'
import { confirmUpload, isR2Configured, isR2Key } from '~/lib/storage'
import { stringValidation } from '~/lib/validations'

export const updateOrganizationLogoAction = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      key: z.string().min(1),
      oldKey: z.string().min(1).nullish()
    })
  )
  .action(async ({ parsedInput }) => {
    if (!isR2Configured() || !isR2Key(parsedInput.key)) {
      return { success: true }
    }

    await assertUserCanManageOrganization(parsedInput.organizationId)

    const org = await db.query.organizationsTable.findFirst({
      where: eq(organizationsTable.id, parsedInput.organizationId),
      columns: {
        id: true,
        logo: true
      }
    })

    if (!org) {
      throw new Error('Organization not found')
    }

    if (org.logo !== parsedInput.key) {
      throw new Error(
        'Organization logo key does not match the current logo key'
      )
    }

    await confirmUpload(parsedInput.key, parsedInput.oldKey)
    return true
  })

export const transferOrganizationOwnershipAction = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      targetMemberId: stringValidation
    })
  )
  .action(async ({ parsedInput: { organizationId, targetMemberId } }) => {
    const membership = await getUserMembershipCached(organizationId)
    if (!membership || membership.role !== 'owner') {
      throw new Error('Only the organization owner can transfer ownership')
    }

    if (targetMemberId === membership.id) {
      throw new Error('You are already the owner of this organization')
    }

    const target = await db.query.membersTable.findFirst({
      where: and(
        eq(membersTable.id, targetMemberId),
        eq(membersTable.organizationId, organizationId)
      )
    })
    if (!target) {
      throw new Error('Selected member does not belong to this organization')
    }

    await db.transaction(async tx => {
      await tx
        .update(membersTable)
        .set({ role: 'owner' })
        .where(eq(membersTable.id, target.id))

      await tx
        .update(membersTable)
        .set({ role: 'admin' })
        .where(eq(membersTable.id, membership.id))
    })

    return true
  })
