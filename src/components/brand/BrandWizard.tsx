'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { StepIndicator } from './StepIndicator'
import { FactsSheetForm } from './FactsSheetForm'
import { saveBrandProfile, updateBrandProfile, type BrandProfileInput } from '@/actions/brand'
import type { BrandProfile, PluginFact } from '@/types'

// Internal form shape — features and useCases are textarea strings, split on save
export interface WizardFormValues {
  // Step 1: Brand Basics
  name: string
  url: string
  targetAudience: string
  // Step 2: Tone & Style
  toneDescription: string
  styleRules: { value: string }[]
  // Step 3: Example Articles
  exampleArticle1: string
  exampleArticle2: string
  // Step 4: Plugin Facts (features/useCases as newline-separated text)
  pluginFacts: {
    name: string
    features: string   // one per line
    pricing: string
    useCases: string   // one per line
  }[]
}

const STEPS = [
  { index: 0, label: 'Brand Basics' },
  { index: 1, label: 'Tone & Style' },
  { index: 2, label: 'Example Articles' },
  { index: 3, label: 'Plugin Facts' },
]

interface BrandWizardProps {
  existingProfile?: BrandProfile | null
  mode?: 'create' | 'edit'
}

function profileToFormValues(profile: BrandProfile): WizardFormValues {
  return {
    name: profile.name ?? '',
    url: profile.url ?? '',
    targetAudience: profile.targetAudience ?? '',
    toneDescription: profile.toneDescription ?? '',
    styleRules: (profile.styleRules ?? ['', '']).map((v) => ({ value: v })),
    exampleArticle1: profile.exampleArticle1 ?? '',
    exampleArticle2: profile.exampleArticle2 ?? '',
    pluginFacts: (profile.pluginFacts ?? [{ name: '', features: '', pricing: '', useCases: '' }]).map(
      (pf: PluginFact | { name: string; features: string; pricing: string; useCases: string }) => ({
        name: (pf as PluginFact).name ?? '',
        features: Array.isArray((pf as PluginFact).features)
          ? (pf as PluginFact).features.join('\n')
          : (pf as { features: string }).features ?? '',
        pricing: (pf as PluginFact).pricing ?? '',
        useCases: Array.isArray((pf as PluginFact).useCases)
          ? (pf as PluginFact).useCases.join('\n')
          : (pf as { useCases: string }).useCases ?? '',
      })
    ),
  }
}

const DEFAULT_VALUES: WizardFormValues = {
  name: '',
  url: '',
  targetAudience: '',
  toneDescription: '',
  styleRules: [{ value: '' }, { value: '' }],
  exampleArticle1: '',
  exampleArticle2: '',
  pluginFacts: [{ name: '', features: '', pricing: '', useCases: '' }],
}

export function BrandWizard({ existingProfile, mode = 'create' }: BrandWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<WizardFormValues>({
    defaultValues: existingProfile ? profileToFormValues(existingProfile) : DEFAULT_VALUES,
  })

  const { fields: styleRuleFields, append: appendStyleRule, remove: removeStyleRule } = useFieldArray({
    control,
    name: 'styleRules',
  })

  const stepFields: Record<number, (keyof WizardFormValues)[]> = {
    0: ['name', 'targetAudience'],
    1: ['toneDescription', 'styleRules'],
    2: ['exampleArticle1'],
    3: ['pluginFacts'],
  }

  async function handleNext() {
    const valid = await trigger(stepFields[currentStep])
    if (valid) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
    }
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  async function onSubmit(data: WizardFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)

    // Transform form values to BrandProfileInput
    const profileInput: BrandProfileInput = {
      name: data.name,
      url: data.url || null,
      targetAudience: data.targetAudience,
      toneDescription: data.toneDescription,
      styleRules: data.styleRules.map((r) => r.value).filter(Boolean),
      pluginFacts: data.pluginFacts.map((pf) => ({
        name: pf.name,
        features: pf.features.split('\n').map((f) => f.trim()).filter(Boolean),
        pricing: pf.pricing,
        useCases: pf.useCases.split('\n').map((u) => u.trim()).filter(Boolean),
      })),
      exampleArticle1: data.exampleArticle1,
      exampleArticle2: data.exampleArticle2 || null,
    }

    try {
      if (mode === 'edit' && existingProfile?.id) {
        await updateBrandProfile(existingProfile.id, profileInput)
      } else {
        await saveBrandProfile(profileInput)
      }
      router.push('/brand')
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save brand profile. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">

          {/* Step 1: Brand Basics */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Brand Basics</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Brand name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('name', { required: 'Brand name is required' })}
                  type="text"
                  placeholder="e.g. Smash Balloon"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Website URL <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  {...register('url')}
                  type="url"
                  placeholder="https://smashballoon.com"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Target audience <span className="text-destructive">*</span>
                </label>
                <textarea
                  {...register('targetAudience', { required: 'Target audience is required' })}
                  rows={3}
                  placeholder="e.g. WordPress site owners who want to display social media feeds without coding"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
                {errors.targetAudience && (
                  <p className="mt-1 text-xs text-destructive">{errors.targetAudience.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Tone & Style */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Tone & Style</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tone description <span className="text-destructive">*</span>
                </label>
                <textarea
                  {...register('toneDescription', { required: 'Tone description is required' })}
                  rows={3}
                  placeholder="Conversational but professional, accessible to non-technical users"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
                {errors.toneDescription && (
                  <p className="mt-1 text-xs text-destructive">{errors.toneDescription.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Writing rules (structural, not adjectives) <span className="text-destructive">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  e.g. &quot;Always open with the reader&apos;s specific problem&quot; — not &quot;conversational&quot;
                </p>

                <div className="space-y-2">
                  {styleRuleFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <input
                        {...register(`styleRules.${index}.value`, {
                          required: index < 2 ? 'At least 2 writing rules are required' : false,
                        })}
                        type="text"
                        placeholder={`Rule ${index + 1}`}
                        className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {index >= 2 && (
                        <button
                          type="button"
                          onClick={() => removeStyleRule(index)}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {styleRuleFields.length < 5 && (
                  <button
                    type="button"
                    onClick={() => appendStyleRule({ value: '' })}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    + Add another rule
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Example Articles */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Example Articles</h2>
              <p className="text-sm text-muted-foreground">
                Paste published articles that represent your ideal tone and structure. The AI will use these as style references — first 1,500 characters are used.
              </p>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Example Article 1 <span className="text-destructive">*</span>
                </label>
                <textarea
                  {...register('exampleArticle1', { required: 'At least one example article is required' })}
                  rows={8}
                  placeholder="Paste a published article from WordPress..."
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
                />
                {errors.exampleArticle1 && (
                  <p className="mt-1 text-xs text-destructive">{errors.exampleArticle1.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Example Article 2 <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <textarea
                  {...register('exampleArticle2')}
                  rows={8}
                  placeholder="Paste a second published article from WordPress..."
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono"
                />
              </div>
            </div>
          )}

          {/* Step 4: Plugin Facts */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Plugin Facts</h2>
              <FactsSheetForm control={control} errors={errors} />
            </div>
          )}

          {submitError && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save Brand Profile'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
