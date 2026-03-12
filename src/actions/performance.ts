'use server'
import { db } from '@/lib/db'
import { performanceData } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { classifyFormatType } from '@/lib/csv/classify'
import type { PerformanceRow } from '@/types'

export async function savePerformanceData(brandId: string, rows: PerformanceRow[]) {
  // Replace: delete all existing rows for this brand, then insert new
  await db.delete(performanceData).where(eq(performanceData.brandId, brandId))
  if (rows.length === 0) return
  await db.insert(performanceData).values(
    rows.map(row => ({
      brandId,
      pageTitle: row.pageTitle,
      sessions: row.sessions,
      bounceRate: row.bounceRate,
      formatType: classifyFormatType(row.pageTitle),
    }))
  )
}

export async function getPerformanceData(brandId: string) {
  return db.select().from(performanceData)
    .where(eq(performanceData.brandId, brandId))
    .orderBy(desc(performanceData.sessions))
}
