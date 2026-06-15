import { FC, ReactNode } from 'react'

export const PageHeading = ({
  title,
  description,
  icon: Icon,
  children
}: {
  title: string
  description: string
  icon?: FC<{ className?: string }>
  children?: ReactNode
}) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : null}
    </div>
  )
}
