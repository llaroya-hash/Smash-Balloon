export type FormatType = 'how-to' | 'list' | 'comparison' | 'other'

export function classifyFormatType(title: string): FormatType {
  const t = title.toLowerCase()
  if (t.includes('how to') || t.includes('how-to')) return 'how-to'
  if (/^\d+\s/.test(t) || t.match(/\b\d+\s+(best|top|ways|tips|steps|reasons|examples|plugins|tools)\b/)) return 'list'
  if (t.includes(' vs ') || t.includes(' vs.') || t.includes('comparison') || t.includes('versus') || t.includes('compared')) return 'comparison'
  return 'other'
}
