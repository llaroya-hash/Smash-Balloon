import { getBrandProfile } from '@/actions/brand'
import { getPerformanceData } from '@/actions/performance'
import { PerformancePageClient } from '@/components/performance/PerformancePageClient'
import Link from 'next/link'

export default async function PerformancePage() {
  const profile = await getBrandProfile()

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Set up your brand profile first before uploading performance data.
          </p>
          <Link
            href="/brand"
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Set up Brand Profile
          </Link>
        </div>
      </div>
    )
  }

  const rawRows = await getPerformanceData(profile.id)

  // Cast formatType from DB (string | null) to the union type used by PerformanceTable
  type RowType = { formatType: 'how-to' | 'list' | 'comparison' | 'other' } & {
    pageTitle: string
    sessions: number
    bounceRate: number | null
  }

  const rows: RowType[] = rawRows.map(row => ({
    pageTitle: row.pageTitle,
    sessions: row.sessions,
    bounceRate: row.bounceRate ?? null,
    formatType: (row.formatType as 'how-to' | 'list' | 'comparison' | 'other') ?? 'other',
  }))

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Performance Data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a Google Analytics 4 CSV export to see which article formats drive the most traffic.
        </p>
      </div>

      <PerformancePageClient brandId={profile.id} initialRows={rows} />
    </div>
  )
}
