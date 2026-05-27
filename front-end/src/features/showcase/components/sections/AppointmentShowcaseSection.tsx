"use client";

import { Calendar } from "lucide-react";
import { AppointmentCard } from "@/shared/components/appointments";
import { showcaseAppointments } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function AppointmentShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const mode = viewMode === "grid" ? "card" : "list";
  const items = [showcaseAppointments.confirmed, showcaseAppointments.pending];

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Calendar} title="Appointment card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        {items.map((appt) => (
          <AppointmentCard key={appt.id} {...appt} viewMode={mode} />
        ))}
      </div>
    </div>
  );
}
