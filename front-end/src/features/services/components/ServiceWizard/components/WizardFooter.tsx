import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WizardDialogFooterProps {
  onCancel: () => void;
  stepIndex: number;
  stepCount: number;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  onSubmit: () => void;
  submitLabel: string;
}

export function WizardDialogFooter({
  onCancel,
  stepIndex,
  stepCount,
  onBack,
  onNext,
  nextDisabled,
  onSubmit,
  submitLabel,
}: WizardDialogFooterProps) {
  const isLast = stepIndex >= stepCount - 1;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="default"
        className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
        onClick={onCancel}
      >
        Cancel
      </Button>
      {stepIndex > 0 && (
        <Button
          variant="outline"
          size="default"
          className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
      {!isLast ? (
        <Button variant="accent" size="default" className="h-10" onClick={onNext} disabled={nextDisabled}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button variant="accent" size="default" className="h-10" onClick={onSubmit}>
          <Save className="w-4 h-4 mr-2" />
          {submitLabel}
        </Button>
      )}
    </div>
  );
}
