"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AccentColor, Theme } from "@/shared/types";
import type { ShowcaseThemeProps } from "../../types";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun; description: string }[] = [
  { value: "light", label: "Light Mode", icon: Sun, description: "Light theme for better visibility" },
  { value: "dark", label: "Dark Mode", icon: Moon, description: "Dark theme for reduced eye strain" },
  { value: "system", label: "System", icon: Monitor, description: "Follow system preference" },
];

const ACCENT_OPTIONS = [
  { value: "orange", label: "Orange", color: "#f97316", bgColor: "rgba(249, 115, 22, 0.2)" },
  { value: "red", label: "Red", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.2)" },
  { value: "green", label: "Green", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.2)" },
  { value: "blue", label: "Blue", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.2)" },
  { value: "yellow", label: "Yellow", color: "#eab308", bgColor: "rgba(234, 179, 8, 0.2)" },
] as const;

export function ThemeAccentSection({
  onThemeChange,
  currentTheme = "dark",
  onAccentColorChange,
  currentAccentColor = "orange",
}: ShowcaseThemeProps) {
  if (!onThemeChange || !onAccentColorChange) return null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Theme & accent</h2>
        <Badge variant="outline" className="border-[var(--glass-border)]">
          Active: {currentTheme} / {currentAccentColor}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Changes apply to the entire showcase (all tabs) for alignment and theme review.
      </p>
      <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <CardHeader>
          <CardTitle>Theme preference</CardTitle>
          <CardDescription>Control application theme and accent color</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = currentTheme === option.value;
              return (
                <Card
                  key={option.value}
                  className={`p-4 cursor-pointer transition-all border-[var(--glass-border)] ${
                    isSelected
                      ? "bg-[var(--accent-bg)] border-[var(--accent-border)]"
                      : "bg-[var(--glass-bg)] hover:border-[var(--accent-border)] hover:bg-accent/50"
                  }`}
                  onClick={() => onThemeChange(option.value)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? "text-[var(--accent-text)]" : "text-muted-foreground"}`} />
                    <div>
                      <p className={`font-medium ${isSelected ? "text-[var(--accent-text)]" : "text-foreground"}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Separator />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ACCENT_OPTIONS.map((color) => {
              const isSelected = currentAccentColor === color.value;
              return (
                <Card
                  key={color.value}
                  className={`p-4 cursor-pointer transition-all border-[var(--glass-border)] ${
                    isSelected ? "border-2" : "hover:bg-accent/50"
                  }`}
                  style={{
                    borderColor: isSelected ? color.color : undefined,
                    backgroundColor: isSelected ? color.bgColor : undefined,
                  }}
                  onClick={() => onAccentColorChange(color.value as AccentColor)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color.color }} />
                    <span className="text-sm font-medium text-foreground">{color.label}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
