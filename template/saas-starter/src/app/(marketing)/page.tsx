import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { siteConfig } from '~/lib/siteConfig'

export default function HomePage() {
  return (
    <section className="container flex flex-col items-center gap-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="text-muted-foreground max-w-xl text-lg">
        {siteConfig.description}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/login">Get Started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact-us">Contact Us</Link>
        </Button>
      </div>
    </section>
  )
}
