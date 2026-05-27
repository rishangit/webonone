import {
  formControlProgressIndicatorClasses,
  formControlProgressTrackClasses,
} from "./form-control-styles";
import { cn } from "./utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  wrapperClassName?: string;
  variant?: "default" | "upload";
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar = ({
  value,
  className,
  wrapperClassName,
  variant = "default",
  showLabel = false,
  label
}: ProgressBarProps) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  const backgroundClass = formControlProgressTrackClasses;

  const gradientClass =
    variant === "upload"
      ? "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
      : formControlProgressIndicatorClasses;

  return (
    <div className={cn("w-full", wrapperClassName)}>
      {showLabel && label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs text-[var(--accent-text)]">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full h-2 overflow-hidden", backgroundClass, className)}>
        <div
          className={cn("h-2 rounded-full transition-all duration-300", gradientClass)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
