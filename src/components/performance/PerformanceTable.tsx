import type { PerformanceRow } from '@/types'
import { cn } from '@/lib/utils'

interface PerformanceTableProps {
  rows: Array<PerformanceRow & { formatType: 'how-to' | 'list' | 'comparison' | 'other' }>
}

const formatTypeBadge: Record<string, string> = {
  'how-to': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'list': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'comparison': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'other': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export function PerformanceTable({ rows }: PerformanceTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No performance data yet. Upload a GA4 CSV to get started.
      </p>
    )
  }

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="py-2 text-xs text-muted-foreground caption-bottom">
          {rows.length} article{rows.length !== 1 ? 's' : ''} — ranked by sessions
        </caption>
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Article Title</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Sessions</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Format Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 text-foreground">{row.pageTitle}</td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {row.sessions.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    formatTypeBadge[row.formatType] ?? formatTypeBadge['other']
                  )}
                >
                  {row.formatType}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
