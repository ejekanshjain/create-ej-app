import { afterEach, describe, expect, test } from 'bun:test'
import {
  addSupportTicketMessageAction,
  createSupportTicketAction,
  getAdminSupportTicketsAction,
  getMyAccountSupportTicketsAction,
  getOrganizationSupportTicketsAction,
  getSupportTicketDetailsAction,
  updateSupportTicketStatusAction
} from '~/app/actions/support-tickets'
import { asUser, expectData, expectServerError, Fixtures } from '../helpers'

describe('support tickets', () => {
  const fx = new Fixtures()
  afterEach(() => fx.cleanup())

  test('organization tickets are shared by managers and hidden from members', async () => {
    const ws = await fx.workspace()

    const created = await asUser(ws.owner, () =>
      createSupportTicketAction({
        organizationId: ws.organization.id,
        subject: 'Invoices are missing',
        priority: 'high',
        message: 'Last month has no invoice.'
      })
    )
    expectData(created)
    expect(created.data.ticketNumber).toMatch(/^TICKET-\d{6}$/)

    const asAdmin = await asUser(ws.admin, () =>
      getSupportTicketDetailsAction({ ticketId: created.data.id })
    )
    expectData(asAdmin)

    const asMember = await asUser(ws.member, () =>
      getSupportTicketDetailsAction({ ticketId: created.data.id })
    )
    expectServerError(asMember, 'permission')

    const memberList = await asUser(ws.member, () =>
      getOrganizationSupportTicketsAction({
        organizationId: ws.organization.id,
        page: 1,
        limit: 10
      })
    )
    expectServerError(memberList, 'permission')
  })

  test('account tickets belong to their author alone', async () => {
    const author = await fx.user()
    const other = await fx.user()

    const created = await asUser(author, () =>
      createSupportTicketAction({
        subject: 'Change my email',
        message: 'I need a new sign-in address.'
      })
    )
    expectData(created)

    const mine = await asUser(author, () =>
      getMyAccountSupportTicketsAction({ page: 1, limit: 10 })
    )
    expectData(mine)
    expect(mine.data[0].map(ticket => ticket.id)).toContain(created.data.id)

    const theirs = await asUser(other, () =>
      getSupportTicketDetailsAction({ ticketId: created.data.id })
    )
    expectServerError(theirs, 'permission')
  })

  test('an admin replying from their own ticket page counts as the customer', async () => {
    const admin = await fx.platformUser('admin')

    const created = await asUser(admin, () =>
      createSupportTicketAction({
        subject: 'My own account',
        message: 'Testing the customer view.'
      })
    )
    expectData(created)

    const reply = await asUser(admin, () =>
      addSupportTicketMessageAction({
        ticketId: created.data.id,
        message: 'Adding detail as the customer.'
      })
    )
    expectData(reply)
    expect(reply.data?.isAdmin).toBe(false)

    const asSupport = await asUser(admin, () =>
      addSupportTicketMessageAction({
        ticketId: created.data.id,
        message: 'Replying as support.',
        asSupport: true
      })
    )
    expectData(asSupport)
    expect(asSupport.data?.isAdmin).toBe(true)
  })

  test('only platform admins list every ticket and change status', async () => {
    const author = await fx.user()
    const admin = await fx.platformUser('admin')

    const created = await asUser(author, () =>
      createSupportTicketAction({
        subject: 'Billing question',
        message: 'Which plan fits a team of 10?'
      })
    )
    expectData(created)

    const denied = await asUser(author, () =>
      getAdminSupportTicketsAction({ page: 1, limit: 10 })
    )
    expectServerError(denied, 'permission')

    const list = await asUser(admin, () =>
      getAdminSupportTicketsAction({ page: 1, limit: 50 })
    )
    expectData(list)
    expect(list.data[0].map(ticket => ticket.id)).toContain(created.data.id)

    const closed = await asUser(admin, () =>
      updateSupportTicketStatusAction({
        ticketId: created.data.id,
        status: 'closed'
      })
    )
    expectData(closed)

    const reply = await asUser(author, () =>
      addSupportTicketMessageAction({
        ticketId: created.data.id,
        message: 'One more thing.'
      })
    )
    expectServerError(reply, 'closed')
  })
})
