import { Calendar, Briefcase, Users, MapPin, User, FileText, CheckCircle } from "lucide-react";
import { WizardStep } from "./types";

export const getSteps = (isCompanyOwner: boolean, selectedEntities?: string[] | null): WizardStep[] => {
  // Always include core steps
  const coreSteps: WizardStep[] = [
    { id: "datetime", title: "Date & Time", icon: Calendar },
    { id: "client", title: "Client", icon: User },
    { id: "notes", title: "Notes", icon: FileText },
    { id: "review", title: "Review", icon: CheckCircle }
  ];

  // Optional steps based on selected entities
  const optionalSteps: WizardStep[] = [];

  // Check if service entity is selected
  if (!selectedEntities || selectedEntities.includes('service')) {
    optionalSteps.push({ id: "service", title: "Service", icon: Briefcase });
  }

  // Check if staff entity is selected
  if (!selectedEntities || selectedEntities.includes('staff')) {
    optionalSteps.push({ 
      id: "staff", 
      title: isCompanyOwner ? "Staff" : "Preferred Staff", 
      icon: Users 
    });
  }

  // Check if space entity is selected
  if (!selectedEntities || selectedEntities.includes('space')) {
    optionalSteps.push({ id: "space", title: "Space", icon: MapPin });
  }

  // Combine steps: datetime, service (if enabled), staff (if enabled), space (if enabled), client, notes, review
  const allSteps: WizardStep[] = [
    coreSteps[0], // datetime
    ...optionalSteps.filter(s => s.id === 'service'), // service (if enabled)
    ...optionalSteps.filter(s => s.id === 'staff'), // staff (if enabled)
    ...optionalSteps.filter(s => s.id === 'space'), // space (if enabled)
    coreSteps[1], // client
    coreSteps[2], // notes
    coreSteps[3]  // review
  ];

  return allSteps;
};
