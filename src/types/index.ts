export interface PluginFact {
  name: string
  features: string[]
  pricing: string
  useCases: string[]
}

export interface BrandProfile {
  id: string
  name: string
  url?: string | null
  brandContextBlock?: string | null
  toneDescription?: string | null
  targetAudience?: string | null
  styleRules?: string[] | null
  pluginFacts?: PluginFact[] | null
  exampleArticle1?: string | null
  exampleArticle2?: string | null
  targetKeywords?: string[] | null
}

export interface ArticleSection {
  heading: string
  headingLevel: 'h2' | 'h3'
  brief: string
  wordCountTarget: number
}

export interface ArticleOutline {
  title: string
  metaDescription: string
  targetKeyword: string
  sections: ArticleSection[]
  ctaPlugin: string
}

export interface PerformanceRow {
  pageTitle: string
  sessions: number
  bounceRate: number | null
  formatType?: 'how-to' | 'list' | 'comparison' | 'other'
}
