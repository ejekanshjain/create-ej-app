import { redirect } from 'next/navigation'
import { getUserOrganizationsCached } from '~/lib/organization-access'
import { OrganizationContextProvider } from '../_components/organization-context'

export default async function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  const organizations = await getUserOrganizationsCached()
  const org = organizations.find(o => o.id === orgId)

  if (!org) {
    return redirect('/app')
  }

  return (
    <OrganizationContextProvider
      value={{
        id: org.id,
        name: org.name,
        role: org.role,
        memberId: org.memberId,
        userId: org.userId
      }}
    >
      {children}
    </OrganizationContextProvider>
  )
}
