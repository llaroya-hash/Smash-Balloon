import Papa from 'papaparse'
import type { PerformanceRow } from '@/types'

function findDataStartIndex(lines: string[]): number {
  return lines.findIndex(line =>
    (line.includes('Page title') || line.includes('Page path')) &&
    line.includes('Sessions')
  )
}

export function parseGA4CSV(file: File): Promise<PerformanceRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const dataStart = findDataStartIndex(lines)
      if (dataStart === -1) {
        resolve([]) // no recognizable header row found
        return
      }
      const cleanCSV = lines.slice(dataStart).join('\n')
      Papa.parse(cleanCSV, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, string>[]
          const mapped = rows
            .filter(row => (row['Page title'] || row['Page path']) && row['Sessions'])
            .map(row => {
              const sessions = parseInt(row['Sessions'] ?? '0', 10)
              return {
                pageTitle: row['Page title'] || row['Page path'] || '',
                sessions,
                bounceRate: row['Bounce rate'] ? parseFloat(row['Bounce rate']) : null,
              }
            })
            .filter(row => row.pageTitle.trim().length > 0 && !isNaN(row.sessions))
          resolve(mapped)
        },
        error: reject,
      })
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
