'use server'

import { and, desc, eq, ne } from 'drizzle-orm'
import { cache } from 'react'
import { z } from 'zod'
import { db } from '~/db'
import { membersTable, organizationsTable, usersTable } from '~/db/schema'
import { AppError, AppErrorCode, rethrowUniqueViolation } from '~/lib/errors'
import {
  assertCanManageOrganization,
  assertRole
} from '~/lib/organization-access'
import { authActionClient, withWideEvent } from '~/lib/safe-action'
import {
  assertOwnedR2Key,
  assertPersistableImageValue,
  confirmUpload,
  deleteOwnedFileQuietly,
  isR2Key,
  resolveImageUrl
} from '~/lib/storage'
import { stringValidation } from '~/lib/validations'
import { updateOrganizationSchema } from './organizations.validation'

/** Every organization the caller belongs to, newest membership first. */
export const getOrganizations = authActionClient.action(
  withWideEvent('getOrganizations', async ({ ctx: { user } }) => {
    const rows = await db
      .select({
        id: organizationsTable.id,
        name: organizationsTable.name,
        slug: organizationsTable.slug,
        logo: organizationsTable.logo,
        role: membersTable.role,
        memberId: membersTable.id
      })
      .from(membersTable)
      .innerJoin(
        organizationsTable,
        eq(membersTable.organizationId, organizationsTable.id)
      )
      .where(eq(membersTable.userId, user.id))
      .orderBy(desc(membersTable.createdAt))

    return rows.map(row => ({ ...row, logoUrl: resolveImageUrl(row.logo) }))
  })
)

/** Per-request cache, so layouts and pages share one query. */
export const getOrganizationsCached = cache(getOrganizations)

/**
 * One organization with the caller's role in it. Returns no data when the
 * caller is not a member, so pages can respond with `notFound()`.
 */
export const getOrganization = authActionClient
  .inputSchema(stringValidation)
  .action(
    withWideEvent(
      'getOrganization',
      async ({ parsedInput: organizationId, ctx: { user } }) => {
        const [row] = await db
          .select({
            id: organizationsTable.id,
            name: organizationsTable.name,
            slug: organizationsTable.slug,
            logo: organizationsTable.logo,
            role: membersTable.role,
            memberId: membersTable.id
          })
          .from(membersTable)
          .innerJoin(
            organizationsTable,
            eq(membersTable.organizationId, organizationsTable.id)
          )
          .where(
            and(
              eq(membersTable.organizationId, organizationId),
              eq(membersTable.userId, user.id)
            )
          )

        return row ? { ...row, logoUrl: resolveImageUrl(row.logo) } : null
      }
    )
  )

export const getOrganizationCached = cache(getOrganization)

/**
 * Saves the organization's name, slug, and logo. The logo must be an upload
 * this organization owns (or a data URL while R2 is off); the replaced file
 * is deleted.
 */
export const updateOrganizationAction = authActionClient
  .inputSchema(updateOrganizationSchema)
  .action(
    withWideEvent(
      'updateOrganizationAction',
      async ({ parsedInput, ctx: { user } }) => {
        const { organizationId } = parsedInput
        await assertCanManageOrganization(organizationId, user.id)

        const org = await db.query.organizationsTable.findFirst({
          where: eq(organizationsTable.id, organizationId),
          columns: { logo: true }
        })

        if (!org) {
          throw new AppError(AppErrorCode.NOT_FOUND, 'Organization not found.')
        }

        const logo = parsedInput.logo || null
        const logoChanged = logo !== org.logo
        // An unchanged logo is already stored, even a data URL saved before R2
        // was configured, so only a new value has to pass the storage rules.
        if (logoChanged) assertPersistableImageValue(logo)

        // Check ownership before saving, and delete the old file only after
        // the save succeeds, so a failed save never loses the current logo.
        if (logoChanged && isR2Key(logo)) {
          await assertOwnedR2Key(logo, organizationId)
        }

        await db
          .update(organizationsTable)
          .set({ name: parsedInput.name, slug: parsedInput.slug, logo })
          .where(eq(organizationsTable.id, organizationId))
          .catch(error =>
            rethrowUniqueViolation(
              error,
              'Another organization already uses this slug. Choose a different one.'
            )
          )

        if (logoChanged && isR2Key(logo)) {
          await confirmUpload(logo, organizationId, org.logo)
        } else if (logoChanged && org.logo) {
          await deleteOwnedFileQuietly(org.logo, organizationId)
        }

        return true
      }
    )
  )

/** Members the owner can hand ownership to: everyone except themselves. */
export const getTransferTargets = authActionClient
  .inputSchema(stringValidation)
  .action(
    withWideEvent(
      'getTransferTargets',
      async ({ parsedInput: organizationId, ctx: { user } }) => {
        const owner = await assertRole(organizationId, user.id, ['owner'])

        return db
          .select({
            memberId: membersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            role: membersTable.role
          })
          .from(membersTable)
          .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
          .where(
            and(
              eq(membersTable.organizationId, organizationId),
              ne(membersTable.id, owner.id)
            )
          )
          .orderBy(usersTable.name)
      }
    )
  )

/** Makes another member the owner. The current owner becomes an admin. */
export const transferOrganizationOwnershipAction = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      targetMemberId: stringValidation
    })
  )
  .action(
    withWideEvent(
      'transferOrganizationOwnershipAction',
      async ({
        parsedInput: { organizationId, targetMemberId },
        ctx: { user }
      }) => {
        const owner = await assertRole(organizationId, user.id, ['owner'])

        if (targetMemberId === owner.id) {
          throw new AppError(
            AppErrorCode.BAD_REQUEST,
            'You already own this organization. Choose another member.'
          )
        }

        const target = await db.query.membersTable.findFirst({
          where: and(
            eq(membersTable.id, targetMemberId),
            eq(membersTable.organizationId, organizationId)
          ),
          columns: { id: true }
        })

        if (!target) {
          throw new AppError(
            AppErrorCode.NOT_FOUND,
            'That member is no longer in this organization. Refresh and choose again.'
          )
        }

        await db.transaction(async tx => {
          await tx
            .update(membersTable)
            .set({ role: 'owner' })
            .where(eq(membersTable.id, target.id))

          await tx
            .update(membersTable)
            .set({ role: 'admin' })
            .where(eq(membersTable.id, owner.id))
        })

        return true
      }
    )
  )
