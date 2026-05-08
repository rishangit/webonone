# AppointmentWizard Component Structure

This folder contains the refactored AppointmentWizard component, split into smaller, more maintainable pieces.

## Folder Structure

```
AppointmentWizard/
├── components/          # Reusable wizard UI components
│   ├── WizardHeader.tsx
│   ├── WizardProgress.tsx
│   ├── WizardSummary.tsx (to be created)
│   └── WizardFooter.tsx (to be created)
├── steps/               # Individual step components
│   ├── DateTimeStep.tsx
│   ├── ServiceStep.tsx (to be created)
│   ├── StaffStep.tsx (to be created)
│   ├── SpaceStep.tsx (to be created)
│   ├── ClientStep.tsx (to be created)
│   ├── NotesStep.tsx
│   ├── ReviewStep.tsx (to be created)
│   └── index.ts
├── types.ts             # TypeScript interfaces and types
├── constants.ts         # Constants (time slots, etc.)
├── utils.ts             # Utility functions
├── stepDefinitions.ts   # Step configuration
├── AppointmentWizard.tsx # Main component
└── index.ts             # Public exports
```

## Refactoring Progress

- ✅ Types extracted to `types.ts`
- ✅ Constants extracted to `constants.ts`
- ✅ Utils extracted to `utils.ts`
- ✅ Step definitions extracted to `stepDefinitions.ts`
- ✅ WizardHeader component created
- ✅ WizardProgress component created
- ✅ DateTimeStep component created
- ✅ NotesStep component created
- ⏳ ServiceStep, StaffStep, SpaceStep, ClientStep, ReviewStep (to be extracted)
- ⏳ WizardSummary component (to be created)
- ⏳ WizardFooter component (to be created)

## Usage

Import from the main index:
```typescript
import { AppointmentWizard } from './pages/appointments/AppointmentWizard';
```
