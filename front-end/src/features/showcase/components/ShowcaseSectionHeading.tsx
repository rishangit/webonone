import type { LucideIcon } from "lucide-react";

interface ShowcaseSectionHeadingProps {
  sectionId: string;
  icon: LucideIcon;
  title: string;
}

export function ShowcaseSectionHeading({ sectionId, icon: Icon, title }: ShowcaseSectionHeadingProps) {
  return (
    <h3
      id={sectionId}
      className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 scroll-mt-24"
    >
      <Icon className="w-5 h-5 text-[var(--accent-text)]" />
      {title}
    </h3>
  );
}
