import { afterEach, describe, expect, test } from 'bun:test'
import { eq } from 'drizzle-orm'
import { getContactLeads } from '~/app/(admin)/actions/contact-leads'
import { getFeedbacks } from '~/app/(admin)/actions/feedbacks'
import { createFeedbackAction } from '~/app/(app)/actions/feedbacks'
import { submitContactForm } from '~/app/(marketing)/contact-us/actions'
import { db } from '~/db'
import { contactLeadsTable } from '~/db/schema'
import {
  asAnonymous,
  asUser,
  expectData,
  expectServerError,
  expectValidationError,
  Fixtures
} from '../helpers'

describe('contact form and feedback inboxes', () => {
  const fx = new Fixtures()
  afterEach(async () => {
    await db
      .delete(contactLeadsTable)
      .where(eq(contactLeadsTable.email, 'visitor@example.com'))
    await fx.cleanup()
  })

  test('anyone can send the contact form; only admins read the leads', async () => {
    const sent = await asAnonymous(() =>
      submitContactForm({
        name: 'Alex Morgan',
        email: 'visitor@example.com',
        subject: 'Pricing',
        message: 'Do you offer annual invoicing?'
      })
    )
    expectData(sent)

    const user = await fx.user()
    expectServerError(
      await asUser(user, () => getContactLeads({ page: 1, limit: 10 })),
      'permission'
    )

    const admin = await fx.platformUser('admin')
    const leads = await asUser(admin, () =>
      getContactLeads({ page: 1, limit: 50, search: 'visitor@example.com' })
    )
    expectData(leads)
    expect(leads.data[0].map(lead => lead.subject)).toContain('Pricing')
  })

  test('the contact form rejects a message too short to answer', async () => {
    const result = await asAnonymous(() =>
      submitContactForm({
        name: 'Alex Morgan',
        email: 'visitor@example.com',
        subject: 'Hi',
        message: 'Hi'
      })
    )
    expectValidationError(result)
  })

  test('admins see member feedback with its organization', async () => {
    const ws = await fx.workspace()
    expectData(
      await asUser(ws.member, () =>
        createFeedbackAction({
          organizationId: ws.organization.id,
          rating: 4,
          comment: 'Setup took five minutes.'
        })
      )
    )

    const admin = await fx.platformUser('admin')
    const list = await asUser(admin, () =>
      getFeedbacks({ page: 1, limit: 50, filters: { rating: [4] } })
    )
    expectData(list)
    const row = list.data[0].find(
      item => item.organizationId === ws.organization.id
    )
    expect(row?.organizationName).toBe(ws.organization.name)
  })
})
