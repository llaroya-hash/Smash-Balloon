import { getBrandProfile } from '@/actions/brand'
import { getPerformanceData } from '@/actions/performance'
import { ArticleStream } from '@/components/article/ArticleStream'
import Link from 'next/link'
import type { PerformanceRow } from '@/types'

function deriveTopFormat(rows: PerformanceRow[]): string | null {
  // Find the format type with the highest total session count
  const totals: Record<string, number> = {}
  for (const row of rows) {
    if (!row.formatType || row.formatType === 'other') continue
    totals[row.formatType] = (totals[row.formatType] ?? 0) + row.sessions
  }
  const entries = Object.entries(totals)
  if (entries.length === 0) return null
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}

export default async function GeneratePage() {
  const profile = await getBrandProfile()

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Set up your brand profile first before generating articles.
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

  const perfRows: PerformanceRow[] = rawRows.map(row => ({
    pageTitle: row.pageTitle,
    sessions: row.sessions,
    bounceRate: row.bounceRate ?? null,
    formatType: (row.formatType as PerformanceRow['formatType']) ?? 'other',
  }))

  const topPerformingFormat = deriveTopFormat(perfRows)

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Generate Article</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a topic, choose your format, and generate a publish-ready WordPress article.
        </p>
      </div>

      <ArticleStream
        brandId={profile.id}
        brandContextBlock={profile.brandContextBlock ?? ''}
        topPerformingFormat={topPerformingFormat}
      />
    </div>
  )
}
