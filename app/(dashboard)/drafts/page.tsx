import { getBrandProfile } from '@/actions/brand'
import { listArticleDrafts } from '@/actions/article'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

type DraftStatus = 'generating' | 'draft_ready' | 'error'

function StatusBadge({ status }: { status: DraftStatus | string | null }) {
  if (status === 'draft_ready') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Draft Ready
      </span>
    )
  }
  if (status === 'generating') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Generating...
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Error
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      {status ?? 'Unknown'}
    </span>
  )
}

export default async function DraftsPage() {
  const profile = await getBrandProfile()

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Set up your brand profile first before viewing drafts.
          </p>
          <Link
            href="/brand"
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Set up Brand Profile
          </Link>
        </div>
      </div>
    )
  }

  const drafts = await listArticleDrafts(profile.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Saved Drafts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Articles are saved automatically after generation completes. Return anytime to copy or regenerate.
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 shadow-sm text-center">
          <p className="text-sm text-muted-foreground mb-4">
            No drafts yet. Go to Generate to create your first article.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Generate an Article
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(draft => {
            const displayTitle = draft.title ?? draft.topic
            const generatedDate = draft.generatedAt
              ? formatDistanceToNow(new Date(draft.generatedAt), { addSuffix: true })
              : 'recently'

            return (
              <div
                key={draft.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-semibold text-foreground truncate">{displayTitle}</h2>
                    <StatusBadge status={draft.status} />
                  </div>
                  {draft.title && draft.topic !== draft.title && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      Topic: {draft.topic}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Generated {generatedDate}
                  </p>
                </div>
                <Link
                  href={`/generate?draftId=${draft.id}`}
                  className="shrink-0 px-3 py-1.5 text-sm font-medium border border-border bg-background text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  Open
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
