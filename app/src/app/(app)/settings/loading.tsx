import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
  return (
    <Shell>
      <Heading heading="Settings" text="Manage account and profile settings." />
      <div className="grid gap-10">
        <Card>
          <CardHeader className="gap-2">
            <Skeleton className="h-6 w-1/5" />
            <Skeleton className="h-4 w-4/5" />
          </CardHeader>
          <CardContent className="h-10">
            <Skeleton className="h-8 w-full max-w-[400px]" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-full max-w-[120px]" />
          </CardFooter>
        </Card>
      </div>
    </Shell>
  )
}

export default Loading
