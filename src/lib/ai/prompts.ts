import type { PluginFact } from '@/types'

interface BrandContextInput {
  name: string
  targetAudience?: string | null
  toneDescription?: string | null
  styleRules?: string[] | null
  pluginFacts?: PluginFact[] | null
  exampleArticle1?: string | null
  exampleArticle2?: string | null
}

export function compileBrandContextBlock(profile: BrandContextInput): string {
  const sections: string[] = []

  // Brand identity header
  sections.push(`## Brand: ${profile.name}`)

  // Target audience
  if (profile.targetAudience) {
    sections.push(`### Target Audience\n${profile.targetAudience}`)
  }

  // Tone description
  if (profile.toneDescription) {
    sections.push(`### Tone & Voice\n${profile.toneDescription}`)
  }

  // Style rules — listed as numbered structural rules
  if (profile.styleRules && profile.styleRules.length > 0) {
    const rulesText = profile.styleRules
      .map((rule, i) => `${i + 1}. ${rule}`)
      .join('\n')
    sections.push(`### Writing Rules (apply to every article)\n${rulesText}`)
  }

  // Plugin facts — with explicit do-not-invent instruction placed BEFORE the facts
  if (profile.pluginFacts && profile.pluginFacts.length > 0) {
    const pluginLines: string[] = [
      '### Plugin Facts',
      'ONLY reference features listed here — never invent capabilities or pricing not specified below.',
      '',
    ]
    for (const plugin of profile.pluginFacts) {
      pluginLines.push(`**${plugin.name}**`)
      if (plugin.features.length > 0) {
        pluginLines.push(`Features: ${plugin.features.join(', ')}`)
      }
      if (plugin.pricing) {
        pluginLines.push(`Pricing: ${plugin.pricing}`)
      }
      if (plugin.useCases.length > 0) {
        pluginLines.push(`Use cases: ${plugin.useCases.join(', ')}`)
      }
      pluginLines.push('')
    }
    sections.push(pluginLines.join('\n').trimEnd())
  }

  // Example articles — truncated to 1500 chars each to avoid context overflow
  if (profile.exampleArticle1) {
    const excerpt = profile.exampleArticle1.slice(0, 1500)
    sections.push(`### Example Article 1 (tone/structure reference)\n${excerpt}`)
  }

  if (profile.exampleArticle2) {
    const excerpt = profile.exampleArticle2.slice(0, 1500)
    sections.push(`### Example Article 2 (tone/structure reference)\n${excerpt}`)
  }

  return sections.join('\n\n')
}

export function buildSEOInstructions(keyword: string, semanticVariants: string[]): string {
  const variantsList = semanticVariants.length > 0
    ? `Semantic variants to use naturally throughout: ${semanticVariants.join(', ')}.`
    : ''

  return [
    `## SEO Instructions`,
    ``,
    `Target keyword: "${keyword}"`,
    ``,
    `Placement guidance (natural integration — not mechanical repetition):`,
    `1. Include the target keyword in the H1 title`,
    `2. Use the target keyword in the opening paragraph`,
    `3. Include it in the meta description`,
    `4. Use it 1–2 additional times where it fits naturally in the body`,
    ``,
    `${variantsList}`,
    ``,
    `Do NOT force the keyword where it reads unnaturally. Semantic coverage and topical relevance matter more than raw keyword frequency.`,
  ].join('\n').trim()
}
