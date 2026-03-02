import { ProgressBar } from "../../../../components/ui/progress-bar";
import { WizardStep } from "../types";

interface WizardProgressProps {
  currentStep: number;
  steps: WizardStep[];
}

export const WizardProgress = ({ currentStep, steps }: WizardProgressProps) => {
  return (
    <div className="shrink-0 px-3 sm:px-4 py-3 sm:py-4">
      <div className="w-1/2 mx-auto">
        <ProgressBar
          value={((currentStep + 1) / steps.length) * 100}
          wrapperClassName=""
        />
        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </p>
      </div>
    </div>
  );
};
