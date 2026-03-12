export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center gap-6">
          <a href="/" className="text-sm font-semibold text-foreground">
            WP Content Studio
          </a>
          <a href="/brand" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Brand
          </a>
          <a href="/performance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Performance
          </a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
