import { Calendar } from "lucide-react";
import { WizardStep } from "../types";

interface WizardHeaderProps {
  currentStep: number;
  steps: WizardStep[];
}

export const WizardHeader = ({ currentStep, steps }: WizardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent-text)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-semibold text-foreground leading-none">
            Create Appointment
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Schedule a new appointment by completing each step of the booking process.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block whitespace-nowrap">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </p>
      </div>
    </div>
  );
};
