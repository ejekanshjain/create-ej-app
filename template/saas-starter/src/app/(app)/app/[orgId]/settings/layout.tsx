import { notFound } from 'next/navigation'
import { getOrganizationCached } from '~/app/(app)/actions/organizations'
import { isManagerRole } from '~/lib/rbac'

/**
 * Settings are for owners and admins. Every action behind these pages checks
 * the role again; this guard only keeps members off pages they cannot use.
 */
export default async function SettingsLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const org = (await getOrganizationCached(orgId))?.data

  if (!org || !isManagerRole(org.role)) {
    return notFound()
  }

  return <>{children}</>
}
