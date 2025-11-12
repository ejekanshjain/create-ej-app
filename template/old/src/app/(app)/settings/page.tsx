import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { getAuthSession } from '@/lib/auth'
import { Render } from './render'

const SettingsPage = async () => {
  const session = await getAuthSession()

  return (
    <Shell>
      <Heading heading="Settings" text="Manage account and profile settings." />
      <div className="grid gap-10">
        <Render name={session?.user.name || ''} />
      </div>
    </Shell>
  )
}

export default SettingsPage
