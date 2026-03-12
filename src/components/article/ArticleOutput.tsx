'use client'

import { useState } from 'react'
import type { ArticleOutline } from '@/types'

interface ArticleOutputProps {
  outline: ArticleOutline
  sections: Record<number, string>
}

export function ArticleOutput({ outline, sections }: ArticleOutputProps) {
  const [copied, setCopied] = useState(false)

  function buildMarkdown(): string {
    const lines: string[] = []

    lines.push(`# ${outline.title}`)
    lines.push('')

    outline.sections.forEach((section, idx) => {
      const prefix = section.headingLevel === 'h2' ? '##' : '###'
      lines.push(`${prefix} ${section.heading}`)
      lines.push('')
      const content = sections[idx] ?? ''
      if (content) {
        // Split on double newline to produce paragraph blocks
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim())
        for (const para of paragraphs) {
          lines.push(para.trim())
          lines.push('')
        }
      }
    })

    if (outline.ctaPlugin) {
      lines.push(`---`)
      lines.push('')
      lines.push(outline.ctaPlugin)
      lines.push('')
    }

    return lines.join('\n')
  }

  async function handleCopy() {
    const markdown = buildMarkdown()
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for environments without clipboard API
      alert('Could not access clipboard. Please select and copy the text manually.')
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{outline.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{outline.metaDescription}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {outline.targetKeyword}
            </span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy article'}
        </button>
      </div>

      {/* Article body */}
      <div className="prose prose-sm max-w-none space-y-4">
        {outline.sections.map((section, idx) => (
          <div key={idx}>
            {section.headingLevel === 'h2' ? (
              <h2 className="text-xl font-semibold text-foreground mt-6 mb-2">{section.heading}</h2>
            ) : (
              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">{section.heading}</h3>
            )}
            {(sections[idx] ?? '').split(/\n\n+/).filter(p => p.trim()).map((para, pIdx) => (
              <p key={pIdx} className="text-sm text-foreground leading-relaxed">
                {para.trim()}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* CTA note */}
      {outline.ctaPlugin && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Plugin tie-in</p>
          <p className="text-sm text-foreground">{outline.ctaPlugin}</p>
        </div>
      )}
    </div>
  )
}
