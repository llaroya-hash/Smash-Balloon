import { getBrandProfile } from '@/actions/brand'
import { BrandWizard } from '@/components/brand/BrandWizard'
import { redirect } from 'next/navigation'

export default async function BrandEditPage() {
  const profile = await getBrandProfile()

  if (!profile) {
    // No brand profile yet — redirect to initial setup
    redirect('/brand')
  }

  // Convert DB row to BrandProfile shape expected by BrandWizard
  const brandProfile = {
    id: profile.id,
    name: profile.name,
    url: profile.url,
    brandContextBlock: profile.brandContextBlock,
    toneDescription: profile.toneDescription,
    targetAudience: profile.targetAudience,
    styleRules: profile.styleRules as string[] | null,
    pluginFacts: profile.pluginFacts as import('@/types').PluginFact[] | null,
    exampleArticle1: profile.exampleArticle1,
    exampleArticle2: profile.exampleArticle2,
    targetKeywords: profile.targetKeywords as string[] | null,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Edit Brand Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your brand voice, writing rules, or plugin facts. Changes take effect on the next article you generate.
        </p>
      </div>
      <BrandWizard existingProfile={brandProfile} mode="edit" />
    </div>
  )
}
