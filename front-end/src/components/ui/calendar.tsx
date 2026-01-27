"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4 w-full",
        month: "flex flex-col gap-6 w-full",
        caption: "flex justify-center pt-2 pb-4 relative items-center w-full",
        caption_label: "text-lg font-semibold text-foreground",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-9 bg-[var(--glass-bg)] border-[var(--glass-border)] p-0 opacity-70 hover:opacity-100 hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] text-foreground hover:text-[var(--accent-text)] transition-all duration-200",
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse",
        head_row: "flex w-full mb-3",
        head_cell:
          "text-muted-foreground rounded-md flex-1 font-medium text-sm text-center py-2",
        row: "flex w-full gap-1 mb-1",
        cell: cn(
          "relative flex-1 text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[var(--accent-bg)] [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "w-full h-12 p-0 font-medium aria-selected:opacity-100 hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] text-foreground transition-all duration-200 rounded-lg",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-[var(--accent-primary)] aria-selected:text-white",
        day_range_end:
          "day-range-end aria-selected:bg-[var(--accent-primary)] aria-selected:text-white",
        day_selected:
          "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] hover:text-white focus:bg-[var(--accent-primary)] focus:text-white shadow-lg ring-2 ring-[var(--accent-border)]",
        day_today: "bg-[var(--accent-bg)] text-[var(--accent-text)] border-2 border-[var(--accent-border)] font-semibold",
        day_outside:
          "day-outside text-muted-foreground/40 aria-selected:text-muted-foreground/40",
        day_disabled: "text-muted-foreground/30 opacity-50",
        day_range_middle:
          "aria-selected:bg-[var(--accent-bg)] aria-selected:text-[var(--accent-text)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
