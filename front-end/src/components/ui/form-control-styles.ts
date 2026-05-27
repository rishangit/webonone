/** Default border and background for inputs, selects, and selection controls. */
export const formControlSurfaceClasses =
  "border-[var(--glass-border)] bg-[var(--input-background)]";

/** Accent border + ring when a form control is focused or open (keyboard or pointer). */
export const formControlFocusClasses =
  "focus:border-[var(--accent-primary)] focus-visible:border-[var(--accent-primary)] focus-visible:ring-[var(--accent-primary)]/25 focus-visible:ring-[3px]";

/** Accent border + ring when a dropdown/popover trigger is open. */
export const formControlOpenClasses =
  "data-[state=open]:border-[var(--accent-primary)] data-[state=open]:ring-[var(--accent-primary)]/25 data-[state=open]:ring-[3px]";

/** Accent border + ring for OTP / slot-style active cells. */
export const formControlActiveClasses =
  "data-[active=true]:border-[var(--accent-primary)] data-[active=true]:ring-[var(--accent-primary)]/25 data-[active=true]:ring-[3px]";

/** Hover / keyboard highlight for Select and dropdown list options. */
export const selectOptionHighlightClasses =
  "hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] focus:bg-[var(--accent-bg)] focus:text-[var(--accent-text)] data-[highlighted]:bg-[var(--accent-bg)] data-[highlighted]:text-[var(--accent-text)] data-[selected=true]:bg-[var(--accent-bg)] data-[selected=true]:text-[var(--accent-text)]";

/** Progress / progress-bar track and fill (form controls + wizards). */
export const formControlProgressTrackClasses = "bg-[var(--input-background)]";
export const formControlProgressIndicatorClasses =
  "bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)]";
