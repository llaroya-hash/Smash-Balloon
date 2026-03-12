import type { ArticleOutline } from '@/types'

export async function generateArticleOutline(
  _topic: string,
  _brandContextBlock: string,
  _topPerformingFormat: string | null,
): Promise<ArticleOutline> {
  return {
    title: '',
    metaDescription: '',
    targetKeyword: '',
    sections: [],
    ctaPlugin: '',
  }
}

export async function streamSection(
  _outline: ArticleOutline,
  _sectionIndex: number,
  _brandContextBlock: string,
): Promise<Response> {
  return new Response('')
}
