import { FC } from 'react'

import { cn } from '@/lib/cn'

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Shell: FC<ShellProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('grid items-start gap-8 p-1', className)} {...props}>
      {children}
    </div>
  )
}
