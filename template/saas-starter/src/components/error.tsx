import { type LucideIcon, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'
import { Button } from '~/components/ui/button'

export const ErrorDisplay: FC<{
  title: string
  message: string
  icon?: LucideIcon
  link?: {
    href?: string
    text?: string
  }
}> = ({ title, message, icon, link }) => {
  const Icon = icon || AlertTriangle
  return (
    <div className="flex w-full flex-col items-center justify-center py-16">
      <Icon className="text-muted-foreground/50 size-16" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2">{message}</p>
      <Button className="mt-4" asChild>
        <Link href={link?.href || '/'}>{link?.text || 'Go Home'}</Link>
      </Button>
    </div>
  )
}
