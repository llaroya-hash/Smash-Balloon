'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/brand', label: 'Brand' },
  { href: '/performance', label: 'Performance' },
  { href: '/generate', label: 'Generate' },
  { href: '/drafts', label: 'Drafts' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-foreground">
            WP Content Studio
          </Link>
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
