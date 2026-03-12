'use client'

interface RegenerateButtonProps {
  onRegenerate: () => void
}

export function RegenerateButton({ onRegenerate }: RegenerateButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onRegenerate}
        className="px-4 py-2 text-sm font-medium border border-border bg-background text-foreground rounded-md hover:bg-muted transition-colors"
      >
        Regenerate Article
      </button>
    </div>
  )
}
