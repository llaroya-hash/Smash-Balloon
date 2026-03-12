'use client'

type FormatOption = {
  value: string
  label: string
}

const FORMAT_OPTIONS: FormatOption[] = [
  { value: 'how-to', label: 'How-To Guide' },
  { value: 'list', label: 'List Post' },
  { value: 'comparison', label: 'Comparison Post' },
  { value: 'general', label: 'General Article' },
]

interface FormatPickerProps {
  topPerformingFormat: string | null
  value: string | null
  onChange: (format: string | null) => void
}

export function FormatPicker({ topPerformingFormat, value, onChange }: FormatPickerProps) {
  const useTopPerforming = value === '__top__'

  const formatLabel = topPerformingFormat
    ? FORMAT_OPTIONS.find(o => o.value === topPerformingFormat)?.label ?? topPerformingFormat
    : null

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Article Format</p>
      <div className="space-y-2">
        {/* Option 1: Use top-performing format — only available if performance data exists */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            topPerformingFormat
              ? useTopPerforming
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              : 'border-border opacity-40 cursor-not-allowed'
          }`}
        >
          <input
            type="radio"
            name="formatChoice"
            value="__top__"
            disabled={!topPerformingFormat}
            checked={useTopPerforming}
            onChange={() => {
              if (topPerformingFormat) onChange('__top__')
            }}
            className="mt-0.5 accent-primary"
          />
          <div>
            <span className="text-sm font-medium text-foreground">Use top-performing format</span>
            {topPerformingFormat && formatLabel ? (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {formatLabel} — based on your performance data
              </span>
            ) : (
              <span className="ml-2 text-xs text-muted-foreground">Upload performance data to unlock</span>
            )}
          </div>
        </label>

        {/* Option 2: Choose format manually */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            !useTopPerforming
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            type="radio"
            name="formatChoice"
            value="manual"
            checked={!useTopPerforming}
            onChange={() => onChange(value === '__top__' ? 'general' : (value ?? 'general'))}
            className="mt-0.5 accent-primary"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-foreground">Choose format manually</span>
            {!useTopPerforming && (
              <select
                value={value ?? 'general'}
                onChange={e => onChange(e.target.value)}
                onClick={e => e.stopPropagation()}
                className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {FORMAT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </label>
      </div>
    </div>
  )
}
