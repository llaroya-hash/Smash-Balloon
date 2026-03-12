'use client'

interface Step {
  label: string
  index: number
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep
        return (
          <div key={step.index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={[
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border-2 transition-colors',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                      ? 'bg-background border-primary text-primary'
                      : 'bg-background border-muted text-muted-foreground',
                ].join(' ')}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.index + 1
                )}
              </div>
              <span
                className={[
                  'mt-1 text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-primary' : 'text-muted-foreground',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  'flex-1 h-0.5 mx-2 mt-[-1rem] transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-muted',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
