import { Briefcase, type LucideIcon } from "lucide-react";
import type { ServiceWizardStep } from "../types";

interface ServiceWizardHeaderProps {
  title: string;
  subtitle: string;
  currentStep: number;
  steps: ServiceWizardStep[];
  icon?: LucideIcon;
}

export function ServiceWizardHeader({
  title,
  subtitle,
  currentStep,
  steps,
  icon: Icon = Briefcase,
}: ServiceWizardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent-text)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-semibold text-foreground leading-none">{title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="shrink-0 hidden sm:block text-right">
        <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
        </p>
      </div>
    </div>
  );
}
