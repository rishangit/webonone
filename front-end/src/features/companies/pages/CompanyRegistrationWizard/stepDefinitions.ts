import { WizardStep } from "./types";

export const getSteps = (): WizardStep[] => {
  return [
    { id: "basic", title: "Company Information", stepNumber: 1 },
    { id: "tags", title: "Business Tags & Size", stepNumber: 2 },
    { id: "contact", title: "Contact Information", stepNumber: 3 },
    { id: "location", title: "Location Information", stepNumber: 4 },
    { id: "review", title: "Review & Submit", stepNumber: 5 }
  ];
};
