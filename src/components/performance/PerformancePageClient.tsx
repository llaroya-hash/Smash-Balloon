'use client'

import { useRouter } from 'next/navigation'
import { CSVUpload } from './CSVUpload'
import { PerformanceTable } from './PerformanceTable'
import type { PerformanceRow } from '@/types'

interface PerformancePageClientProps {
  brandId: string
  initialRows: Array<PerformanceRow & { formatType: 'how-to' | 'list' | 'comparison' | 'other' }>
}

export function PerformancePageClient({ brandId, initialRows }: PerformancePageClientProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-1">Upload Performance Data</h2>
        <CSVUpload
          brandId={brandId}
          onUploadComplete={() => router.refresh()}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Performance Data
        </h2>
        <PerformanceTable rows={initialRows} />
      </div>
    </div>
  )
}
