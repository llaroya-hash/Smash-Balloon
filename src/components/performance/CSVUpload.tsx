'use client'

import { useRef, useState, useTransition } from 'react'
import { parseGA4CSV } from '@/lib/csv/parse'
import { savePerformanceData } from '@/actions/performance'
import { Button } from '@/components/ui/button'

interface CSVUploadProps {
  brandId: string
  onUploadComplete?: () => void
}

export function CSVUpload({ brandId, onUploadComplete }: CSVUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<
    | { type: 'idle' }
    | { type: 'parsing' }
    | { type: 'saving' }
    | { type: 'success'; count: number }
    | { type: 'error'; message: string }
  >({ type: 'idle' })
  const [isPending, startTransition] = useTransition()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so re-uploading same file triggers onChange
    if (inputRef.current) inputRef.current.value = ''

    setStatus({ type: 'parsing' })

    try {
      const rows = await parseGA4CSV(file)

      if (rows.length === 0) {
        // Try to distinguish "no header found" vs "empty data"
        setStatus({
          type: 'error',
          message:
            "No data rows found after parsing. If this is a GA4 export, verify it contains 'Page title' and 'Sessions' columns.",
        })
        return
      }

      setStatus({ type: 'saving' })

      startTransition(async () => {
        await savePerformanceData(brandId, rows)
        setStatus({ type: 'success', count: rows.length })
        onUploadComplete?.()
      })
    } catch {
      setStatus({
        type: 'error',
        message: "Could not find 'Page title' and 'Sessions' columns. Check this is a GA4 page report export.",
      })
    }
  }

  const busy = status.type === 'parsing' || status.type === 'saving' || isPending

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Upload your Google Analytics 4 CSV export. New uploads replace existing data.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Uploading...' : 'Choose CSV file'}
        </Button>

        {status.type === 'success' && (
          <span className="text-sm text-green-600 dark:text-green-400">
            {status.count} row{status.count !== 1 ? 's' : ''} uploaded successfully.
          </span>
        )}
      </div>

      {status.type === 'error' && (
        <p className="text-sm text-destructive">{status.message}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="sr-only"
        aria-label="Upload GA4 CSV file"
        onChange={handleFileChange}
      />
    </div>
  )
}
