import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const WizardProgress = ({ currentStep, totalSteps }: WizardProgressProps) => {
  return (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm ${
            step <= currentStep 
              ? 'bg-[var(--accent-primary)] text-[var(--accent-button-text)]' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {step < currentStep ? (
              <Check className="w-3 h-3 md:w-4 md:h-4" />
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div className={`w-4 md:w-12 h-0.5 mx-0.5 md:mx-2 ${
              step < currentStep ? 'bg-[var(--accent-primary)]' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};
