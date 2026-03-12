'use client'

import { useRef, useState } from 'react'
import { FormatPicker } from '@/components/performance/FormatPicker'
import { ArticleOutput } from '@/components/article/ArticleOutput'
import { RegenerateButton } from '@/components/article/RegenerateButton'
import { initArticleGeneration, updateArticleDraft } from '@/actions/article'
import type { ArticleOutline } from '@/types'

type Phase = 'idle' | 'outline' | 'sections' | 'complete' | 'error'

interface ArticleStreamProps {
  brandId: string
  brandContextBlock: string
  topPerformingFormat: string | null
}

export function ArticleStream({ brandId, brandContextBlock, topPerformingFormat }: ArticleStreamProps) {
  const [topic, setTopic] = useState('')
  // Format selection: '__top__' means use top-performing, otherwise the manual format value
  const [selectedFormat, setSelectedFormat] = useState<string | null>('general')

  const [phase, setPhase] = useState<Phase>('idle')
  const [outline, setOutline] = useState<ArticleOutline | null>(null)
  const [sections, setSections] = useState<Record<number, string>>({})
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(-1)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // Resolve the actual format string to send to the API
  function resolveFormat(): string | null {
    if (selectedFormat === '__top__') return topPerformingFormat
    return selectedFormat
  }

  async function streamSection(
    currentOutline: ArticleOutline,
    sectionIndex: number,
    sectionType: 'section' | 'introduction' | 'conclusion',
    bodySections?: Record<number, string>,
  ): Promise<void> {
    setCurrentSectionIndex(sectionIndex)

    // Scroll to the section
    setTimeout(() => {
      sectionRefs.current[sectionIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    const res = await fetch('/api/generate/section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outline: currentOutline,
        sectionIndex,
        sectionType,
        brandContextBlock,
        bodySections: bodySections ? Object.values(bodySections) : undefined,
      }),
    })

    if (!res.ok || !res.body) {
      throw new Error(`Section generation failed: ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    // Parse the AI SDK data stream format (lines prefixed with "0:", "e:", "d:")
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('0:')) {
          // Text delta — JSON-encoded string after "0:"
          try {
            const token = JSON.parse(line.slice(2))
            if (typeof token === 'string') {
              setSections(prev => ({
                ...prev,
                [sectionIndex]: (prev[sectionIndex] ?? '') + token,
              }))
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    }
  }

  async function handleGenerate() {
    if (!topic.trim()) return
    setPhase('outline')
    setOutline(null)
    setSections({})
    setCurrentSectionIndex(-1)
    setErrorMessage(null)

    try {
      const resolvedFormat = resolveFormat()

      // Step 1: Create draft record
      const draft = await initArticleGeneration(brandId, topic.trim(), resolvedFormat)
      setDraftId(draft.id)

      // Step 2: Generate outline
      const outlineRes = await fetch('/api/generate/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), brandContextBlock, selectedFormat: resolvedFormat }),
      })

      if (!outlineRes.ok) {
        throw new Error(`Outline generation failed: ${outlineRes.status}`)
      }

      const currentOutline: ArticleOutline = await outlineRes.json()
      setOutline(currentOutline)
      setPhase('sections')

      // Step 3: Generate body sections (all except last 2 which are intro/conclusion)
      // The pipeline order per RESEARCH.md: body sections → introduction → conclusion
      // Sections array: [body0, body1, ..., introduction, conclusion] (last 2 = intro/conclusion)
      const totalSections = currentOutline.sections.length
      const bodyCount = Math.max(0, totalSections - 2)
      const introIndex = totalSections - 2
      const conclusionIndex = totalSections - 1

      const completedBodySections: Record<number, string> = {}

      // Generate body sections sequentially
      for (let i = 0; i < bodyCount; i++) {
        await streamSection(currentOutline, i, 'section')
        // Capture the latest value from state via a snapshot
        setSections(prev => {
          completedBodySections[i] = prev[i] ?? ''
          return prev
        })
        // Small delay to ensure state update is captured
        await new Promise<void>(resolve => setTimeout(resolve, 50))
        setSections(prev => {
          completedBodySections[i] = prev[i] ?? ''
          return prev
        })
      }

      // Step 4: Generate introduction (with body sections as context)
      if (totalSections >= 2) {
        await streamSection(currentOutline, introIndex, 'introduction', completedBodySections)
        setSections(prev => {
          completedBodySections[introIndex] = prev[introIndex] ?? ''
          return prev
        })
        await new Promise<void>(resolve => setTimeout(resolve, 50))
        setSections(prev => {
          completedBodySections[introIndex] = prev[introIndex] ?? ''
          return prev
        })
      }

      // Step 5: Generate conclusion (with body sections + intro as context)
      if (totalSections >= 1) {
        await streamSection(currentOutline, conclusionIndex, 'conclusion', completedBodySections)
        setSections(prev => {
          completedBodySections[conclusionIndex] = prev[conclusionIndex] ?? ''
          return prev
        })
        await new Promise<void>(resolve => setTimeout(resolve, 50))
      }

      // Step 6: Assemble full content and save
      const finalSections: Record<number, string> = {}
      setSections(prev => {
        Object.assign(finalSections, prev)
        return prev
      })

      // Assemble markdown content
      const fullContent = assembleMarkdown(currentOutline, finalSections)

      await updateArticleDraft(draft.id, {
        fullContent,
        title: currentOutline.title,
        metaDescription: currentOutline.metaDescription,
        targetKeyword: currentOutline.targetKeyword,
        outline: currentOutline,
        status: 'draft_ready',
      })

      setPhase('complete')
    } catch (err) {
      console.error('Generation error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during generation.')
      setPhase('error')
      if (draftId) {
        await updateArticleDraft(draftId, { status: 'error' }).catch(() => {})
      }
    }
  }

  async function handleRegenerate() {
    await handleGenerate()
  }

  const isGenerating = phase === 'outline' || phase === 'sections'

  return (
    <div className="space-y-6">
      {/* Input area */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-foreground mb-1">
            Topic or keyword to write about
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            disabled={isGenerating}
            rows={2}
            placeholder="e.g. How to add a booking form to your WordPress site"
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-60"
          />
        </div>

        <FormatPicker
          topPerformingFormat={topPerformingFormat}
          value={selectedFormat}
          onChange={setSelectedFormat}
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Article'}
        </button>
      </div>

      {/* Outline skeleton + streaming sections */}
      {(phase === 'sections' || phase === 'complete') && outline && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-foreground">{outline.title}</h1>
            {outline.targetKeyword && (
              <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {outline.targetKeyword}
              </span>
            )}
          </div>

          {outline.sections.map((section, idx) => (
            <div
              key={idx}
              ref={el => { sectionRefs.current[idx] = el }}
              className="space-y-2"
            >
              {section.headingLevel === 'h2' ? (
                <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
              ) : (
                <h3 className="text-lg font-medium text-foreground">{section.heading}</h3>
              )}
              {sections[idx] ? (
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {sections[idx]}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
                  <div className="h-3 bg-muted rounded animate-pulse w-4/6" />
                </div>
              )}
              {idx === currentSectionIndex && phase === 'sections' && (
                <span className="inline-block w-0.5 h-4 bg-primary animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Outline phase — waiting for outline */}
      {phase === 'outline' && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Generating article structure...
          </div>
        </div>
      )}

      {/* Completed article output */}
      {phase === 'complete' && outline && (
        <>
          <ArticleOutput outline={outline} sections={sections} />
          <RegenerateButton onRegenerate={handleRegenerate} />
        </>
      )}

      {/* Error state */}
      {phase === 'error' && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm text-destructive">
          {errorMessage ?? 'An error occurred. Please try again.'}
          <button
            onClick={() => setPhase('idle')}
            className="ml-3 text-xs underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

// Assemble sections into clean markdown for WordPress Gutenberg paste
function assembleMarkdown(outline: ArticleOutline, sections: Record<number, string>): string {
  const lines: string[] = []

  lines.push(`# ${outline.title}`)
  lines.push('')
  lines.push(`*Meta description: ${outline.metaDescription}*`)
  lines.push('')

  outline.sections.forEach((section, idx) => {
    const prefix = section.headingLevel === 'h2' ? '##' : '###'
    lines.push(`${prefix} ${section.heading}`)
    lines.push('')
    const content = sections[idx] ?? ''
    if (content) {
      lines.push(content)
      lines.push('')
    }
  })

  if (outline.ctaPlugin) {
    lines.push(`---`)
    lines.push(`*Plugin tie-in: ${outline.ctaPlugin}*`)
    lines.push('')
  }

  return lines.join('\n')
}
