import { redirect } from 'next/navigation'
import { getAuthSession } from '~/lib/auth'

/**
 * Route guard for the admin Settings section.
 *
 * The parent admin layout already restricts access to `admin` and
 * `superadmin`. This layout further narrows `/admin/settings/*` (user & role
 * management and impersonation) to `superadmin` only. `admin` users are
 * redirected back to the dashboard.
 */
export default async function SettingsLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const authSession = await getAuthSession()

  if (!authSession?.isSuperAdmin) {
    return redirect('/admin')
  }

  return <>{children}</>
}
