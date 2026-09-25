import {
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  Ticket
} from 'lucide-react'
import Link from 'next/link'
import { PageHeading } from '~/components/page-heading'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'

const SHORTCUTS = [
  {
    title: 'Support Tickets',
    description: 'Answer customer tickets and update their status.',
    href: '/admin/support-tickets',
    icon: Ticket
  },
  {
    title: 'Feedback',
    description: 'Read ratings and comments sent from the app.',
    href: '/admin/feedbacks',
    icon: MessageCircle
  },
  {
    title: 'Contact Leads',
    description: 'Follow up on contact form messages.',
    href: '/admin/contact-leads',
    icon: MessageSquare
  }
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Dashboard"
        description="Jump to the queues that need a reply."
        icon={LayoutDashboard}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHORTCUTS.map(item => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="group-hover:border-primary h-full transition-colors">
              <CardHeader>
                <item.icon className="text-primary mb-2 size-5" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
