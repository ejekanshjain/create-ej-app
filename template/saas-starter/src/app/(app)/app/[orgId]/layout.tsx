import { notFound } from 'next/navigation'
import { getOrganizationCached } from '../../actions/organizations'
import { OrganizationContextProvider } from '../_components/organization-context'

export default async function OrganizationLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const org = (await getOrganizationCached(orgId))?.data

  if (!org) {
    return notFound()
  }

  return (
    <OrganizationContextProvider
      value={{
        id: org.id,
        name: org.name,
        role: org.role,
        memberId: org.memberId
      }}
    >
      {children}
    </OrganizationContextProvider>
  )
}
