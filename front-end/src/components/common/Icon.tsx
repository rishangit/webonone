import { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";

interface IconProps {
  icon: LucideIcon;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  color?: 
    | "default" 
    | "muted" 
    | "accent" 
    | "primary" 
    | "secondary" 
    | "success" 
    | "warning" 
    | "error" 
    | "info"
    | "foreground"
    | "card-foreground"
    | "popover-foreground";
}

const sizeMap = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10",
};

// Automatic mobile size mapping - icons are one size larger on mobile
const mobileSizeMap: Record<keyof typeof sizeMap, keyof typeof sizeMap> = {
  xs: "sm",    // xs -> sm on mobile
  sm: "md",    // sm -> md on mobile
  md: "lg",    // md -> lg on mobile (most common)
  lg: "xl",    // lg -> xl on mobile
  xl: "2xl",   // xl -> 2xl on mobile
  "2xl": "2xl", // 2xl stays 2xl on mobile
};

const colorMap = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  accent: "text-[var(--accent-text)]",
  primary: "text-[var(--accent-primary)]",
  secondary: "text-[var(--accent-secondary)]",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  foreground: "text-foreground",
  "card-foreground": "text-card-foreground",
  "popover-foreground": "text-popover-foreground",
};

export const Icon = ({ 
  icon: IconComponent, 
  className, 
  size = "md",
  color
}: IconProps) => {
  // Get desktop size
  const desktopSize = sizeMap[size];
  
  // Automatically determine mobile size (one size larger)
  const mobileSizeKey = mobileSizeMap[size];
  const mobileSize = sizeMap[mobileSizeKey];
  
  // Build responsive size classes - mobile size first, then desktop size with md: prefix
  const [mobileW, mobileH] = mobileSize.split(' ');
  const [desktopW, desktopH] = desktopSize.split(' ');
  const responsiveSize = `${mobileW} ${mobileH} md:${desktopW} md:${desktopH}`;

  const colorClass = color ? colorMap[color] : "";

  // Add a dummy class containing "size-" to prevent global CSS override
  // This prevents: svg:not([class*="size-"]) from applying default size-4
  const preventGlobalOverride = "size-custom";

  return (
    <IconComponent className={cn(responsiveSize, preventGlobalOverride, colorClass, className)} />
  );
};
