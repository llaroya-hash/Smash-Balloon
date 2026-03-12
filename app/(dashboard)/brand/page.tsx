import { getBrandProfile } from '@/actions/brand'
import { BrandWizard } from '@/components/brand/BrandWizard'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function BrandPage() {
  const profile = await getBrandProfile()

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Brand Voice Setup</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your brand profile to ensure every generated article matches your voice and accurately represents your plugins.
          </p>
        </div>
        <BrandWizard mode="create" />
      </div>
    )
  }

  const styleRulesCount = profile.styleRules?.length ?? 0
  const pluginCount = profile.pluginFacts?.length ?? 0
  const lastUpdated = profile.updatedAt
    ? formatDistanceToNow(new Date(profile.updatedAt), { addSuffix: true })
    : 'recently'

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Updated {lastUpdated}</p>
        </div>
        <Link
          href="/brand/edit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Edit Brand Profile
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Brand Details</h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-foreground">Name: </span>
              <span className="text-sm text-muted-foreground">{profile.name}</span>
            </div>
            {profile.url && (
              <div>
                <span className="text-sm font-medium text-foreground">URL: </span>
                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {profile.url}
                </a>
              </div>
            )}
            {profile.targetAudience && (
              <div>
                <span className="text-sm font-medium text-foreground">Audience: </span>
                <span className="text-sm text-muted-foreground">{profile.targetAudience}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Content Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{styleRulesCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Writing Rules</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{pluginCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Plugin{pluginCount !== 1 ? 's' : ''} Configured</div>
            </div>
          </div>
        </div>

        {profile.toneDescription && (
          <div className="border-t border-border pt-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tone</h2>
            <p className="text-sm text-muted-foreground">{profile.toneDescription}</p>
          </div>
        )}

        {profile.styleRules && profile.styleRules.length > 0 && (
          <div className="border-t border-border pt-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Writing Rules</h2>
            <ol className="space-y-1">
              {profile.styleRules.map((rule, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{i + 1}.</span> {rule}
                </li>
              ))}
            </ol>
          </div>
        )}

        {profile.pluginFacts && profile.pluginFacts.length > 0 && (
          <div className="border-t border-border pt-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Plugins</h2>
            <div className="space-y-2">
              {profile.pluginFacts.map((plugin, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-foreground">{plugin.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {plugin.features.length} feature{plugin.features.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{plugin.pricing}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
