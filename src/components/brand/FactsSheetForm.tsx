'use client'

import { useFieldArray, Control, FieldErrors } from 'react-hook-form'
import type { WizardFormValues } from './BrandWizard'

interface FactsSheetFormProps {
  control: Control<WizardFormValues>
  errors: FieldErrors<WizardFormValues>
}

export function FactsSheetForm({ control, errors }: FactsSheetFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pluginFacts',
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Plugin Facts Sheet</h3>
        <p className="text-xs text-muted-foreground">
          Add structured facts for each plugin. The AI will ONLY reference features listed here — it will never invent capabilities.
        </p>
      </div>

      {fields.map((field, index) => (
        <PluginFactCard
          key={field.id}
          index={index}
          control={control}
          errors={errors}
          onRemove={() => remove(index)}
          canRemove={fields.length > 1}
        />
      ))}

      {fields.length < 5 && (
        <button
          type="button"
          onClick={() =>
            append({ name: '', features: '', pricing: '', useCases: '' })
          }
          className="w-full py-2 px-4 border-2 border-dashed border-muted rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + Add another plugin
        </button>
      )}

      {errors.pluginFacts?.root && (
        <p className="text-sm text-destructive">{errors.pluginFacts.root.message}</p>
      )}
    </div>
  )
}

interface PluginFactCardProps {
  index: number
  control: Control<WizardFormValues>
  errors: FieldErrors<WizardFormValues>
  onRemove: () => void
  canRemove: boolean
}

function PluginFactCard({ index, control, errors, onRemove, canRemove }: PluginFactCardProps) {
  // We need register from control — use the internal methods
  const { register } = control as unknown as { register: (name: string, opts?: object) => object }

  const pluginErrors = errors.pluginFacts?.[index]

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Plugin {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Plugin name <span className="text-destructive">*</span>
        </label>
        <input
          {...(register(`pluginFacts.${index}.name`, { required: 'Plugin name is required' }) as object)}
          type="text"
          placeholder="e.g. Social Feed Pro"
          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {(pluginErrors as { name?: { message?: string } })?.name && (
          <p className="mt-1 text-xs text-destructive">{(pluginErrors as { name?: { message?: string } }).name?.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Key features <span className="text-destructive">*</span>
          <span className="text-xs text-muted-foreground ml-1">(one per line)</span>
        </label>
        <textarea
          {...(register(`pluginFacts.${index}.features`, { required: 'At least one feature is required' }) as object)}
          rows={3}
          placeholder={'Instagram feed display\nAuto-refresh\nCustomizable layout'}
          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
        {(pluginErrors as { features?: { message?: string } })?.features && (
          <p className="mt-1 text-xs text-destructive">{(pluginErrors as { features?: { message?: string } }).features?.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Pricing <span className="text-destructive">*</span>
        </label>
        <input
          {...(register(`pluginFacts.${index}.pricing`, { required: 'Pricing is required' }) as object)}
          type="text"
          placeholder="e.g. $49/year, Free + $49/year Pro"
          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {(pluginErrors as { pricing?: { message?: string } })?.pricing && (
          <p className="mt-1 text-xs text-destructive">{(pluginErrors as { pricing?: { message?: string } }).pricing?.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Main use cases <span className="text-destructive">*</span>
          <span className="text-xs text-muted-foreground ml-1">(one per line)</span>
        </label>
        <textarea
          {...(register(`pluginFacts.${index}.useCases`, { required: 'At least one use case is required' }) as object)}
          rows={3}
          placeholder={'Display Instagram feed on homepage\nEmbed social proof on landing pages'}
          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
        {(pluginErrors as { useCases?: { message?: string } })?.useCases && (
          <p className="mt-1 text-xs text-destructive">{(pluginErrors as { useCases?: { message?: string } }).useCases?.message}</p>
        )}
      </div>
    </div>
  )
}
