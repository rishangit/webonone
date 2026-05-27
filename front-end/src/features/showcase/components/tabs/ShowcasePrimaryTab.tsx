"use client";

import type { ShowcasePrimaryTabProps } from "../../types";
import { ButtonsSection, FormControlsSection, ThemeAccentSection } from "../primitives";

export function ShowcasePrimaryTab(props: ShowcasePrimaryTabProps) {
  return (
    <div className="space-y-8 mt-6">
      <ThemeAccentSection {...props} />
      <ButtonsSection />
      <FormControlsSection />
    </div>
  );
}
