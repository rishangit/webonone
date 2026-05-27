"use client";

import { useState, type ReactNode } from "react";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit,
  FileText,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Save,
  Trash2,
  UserPlus,
} from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { notifyShowcaseOnly } from "../../fixtures";

const noop = () => notifyShowcaseOnly();

const FILTER_BUTTON_INACTIVE =
  "h-9 bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground";

const FILTER_BUTTON_ACTIVE =
  "h-9 bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]";

const DIALOG_CANCEL_CLASS =
  "h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent";

const NAV_ICON_CLASS = "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent";

const KEBAB_TRIGGER_CLASS =
  "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent";

interface ButtonGroupProps {
  title: string;
  description: string;
  children: ReactNode;
}

function ButtonGroup({ title, description, children }: ButtonGroupProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        {children}
      </div>
    </div>
  );
}

export function ControlButtonsSection() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [calendarMode, setCalendarMode] = useState<"day" | "week" | "month">("week");

  return (
    <section id="showcase-controls-buttons" className="space-y-8 scroll-mt-24">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Control buttons</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Composed patterns built from <code className="text-xs">@/components/ui/button</code> and shared
          helpers — same styles used on list pages, detail headers, calendars, filters, and dialogs.
        </p>
      </div>

      <ButtonGroup
        title="Base variants"
        description="Primary tab shows sizes and disabled states; these are the variants used in production."
      >
        <Button variant="accent">Accent (default)</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </ButtonGroup>

      <ButtonGroup
        title="Back navigation"
        description="@/components/common/BackButton — detail pages, profiles, bills (outline sm + ArrowLeft)."
      >
        <BackButton onClick={noop} label="Back" />
      </ButtonGroup>

      <ButtonGroup
        title="Page header · primary action"
        description="List / management pages — accent CTA with leading icon (Add Service, New Appointment, etc.)."
      >
        <Button variant="accent" onClick={noop}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
        <Button
          variant="accent"
          onClick={noop}
          className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </ButtonGroup>

      <ButtonGroup
        title="Page header · secondary actions"
        description="Outline sm on headers when multiple actions exist (e.g. Users page)."
      >
        <Button variant="outline" size="sm" onClick={noop} className="inline-flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Create New User
        </Button>
        <Button variant="accent" size="sm" onClick={noop} className="inline-flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add User to Company
        </Button>
      </ButtonGroup>

      <ButtonGroup
        title="Filter toolbar"
        description="Filter toggle on list pages — outline h-9; accent styling when filters are active."
      >
        <Button variant="outline" onClick={noop} className={FILTER_BUTTON_INACTIVE}>
          <Filter className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <Button variant="outline" onClick={noop} className={FILTER_BUTTON_ACTIVE}>
          <Filter className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={noop}
          className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
        >
          Clear All Filters
        </Button>
      </ButtonGroup>

      <ButtonGroup
        title="Segmented control (glass group)"
        description="ViewSwitcher and calendar mode toggles — ghost vs accent inside a glass rounded-lg shell."
      >
        <div className="flex items-center gap-1 backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-1 h-9">
          <Button
            variant={viewMode === "grid" ? "accent" : "ghost"}
            onClick={() => setViewMode("grid")}
            className="h-7 px-3"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "accent" : "ghost"}
            onClick={() => setViewMode("list")}
            className="h-7 px-3"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-1 h-9">
          {(
            [
              { id: "day" as const, icon: CalendarDays, label: "Day" },
              { id: "week" as const, icon: Calendar, label: "Week" },
              { id: "month" as const, icon: Calendar, label: "Month" },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={calendarMode === id ? "accent" : "ghost"}
              onClick={() => setCalendarMode(id)}
              className="h-7 px-3"
            >
              <Icon className="w-4 h-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </ButtonGroup>

      <ButtonGroup
        title="Calendar / timeline navigation"
        description="Ghost icon prev/next (WeekView, TimelineView); Today uses outline sm on glass."
      >
        <Button variant="ghost" size="icon" onClick={noop} className={NAV_ICON_CLASS}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={noop}
          className="h-7 px-3 text-xs bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent"
        >
          Today
        </Button>
        <Button variant="ghost" size="icon" onClick={noop} className={NAV_ICON_CLASS}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </ButtonGroup>

      <ButtonGroup
        title="Detail header · actions menu trigger"
        description="Service / product detail — outline sm opens dropdown (see Menus section for kebab items)."
      >
        <Button variant="outline" size="sm" onClick={noop} className="border-[var(--glass-border)]">
          <FileText className="w-4 h-4 mr-2" />
          Actions
        </Button>
      </ButtonGroup>

      <ButtonGroup
        title="Card / row · icon controls"
        description="Kebab trigger on cards and list rows (system-kebab-menu rule)."
      >
        <Button variant="ghost" size="icon" onClick={noop} className={KEBAB_TRIGGER_CLASS} aria-label="More actions">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </ButtonGroup>

      <ButtonGroup
        title="Dialog & wizard footers"
        description="CustomDialog footer — Cancel outline h-10; Save accent h-10. Wizards: Previous outline + Next accent."
      >
        <Button variant="outline" onClick={noop} className={DIALOG_CANCEL_CLASS}>
          Cancel
        </Button>
        <Button variant="accent" onClick={noop} className="h-10">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button
          variant="outline"
          onClick={noop}
          className="border-[var(--accent-border)] text-foreground hover:bg-[var(--accent-bg)]"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button variant="accent" onClick={noop}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </ButtonGroup>

      <ButtonGroup
        title="Edit & delete actions"
        description="Inline row actions and destructive confirms."
      >
        <Button variant="outline" onClick={noop}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={noop}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <Button
          variant="destructive"
          onClick={noop}
          className="bg-[oklch(0.637_0.237_25.331)] text-white hover:bg-[oklch(0.637_0.237_25.331)]/90"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Confirm delete
        </Button>
      </ButtonGroup>

      <ButtonGroup
        title="Empty state CTA"
        description="EmptyState action — accent with optional leading icon."
      >
        <Button variant="accent" onClick={noop}>
          <Plus className="w-4 h-4 mr-2" />
          Add item
        </Button>
      </ButtonGroup>
    </section>
  );
}
