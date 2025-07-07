import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

type ProgressTrackerProps = {
  steps: string[];
  currentStep: string;
  className?: string;
};

export default function ProgressTracker({ steps, currentStep, className }: ProgressTrackerProps) {
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className={cn('flex items-center w-full', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2',
                  isCompleted ? 'bg-accent border-accent text-accent-foreground' : '',
                  isCurrent ? 'border-primary' : '',
                  !isCompleted && !isCurrent ? 'bg-secondary border-border' : ''
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className={cn('text-sm font-bold', isCurrent ? 'text-primary' : 'text-muted-foreground')}>
                    {index + 1}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  'text-xs mt-2 text-center w-20',
                  isCompleted || isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                )}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1',
                  isCompleted || isCurrent ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
