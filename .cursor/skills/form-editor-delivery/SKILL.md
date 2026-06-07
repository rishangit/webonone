---
name: form-editor-delivery
description: Orchestrates FormBuilder and custom forms work — builder UX, field modules, validation, form list CRUD, appointment fill and submissions, backend routes. Use when delegating form-editor tasks to a Task subagent or delivering multi-file form features.
disable-model-invocation: true
---

# Form Editor Delivery

Orchestrator for `features/customForms/` and `companyCustomForm*` backend. Composes form-field and Redux skills.

## When to delegate vs inline

| Scope | Action |
|-------|--------|
| Single new field type | [form-editor-field](../form-editor-field/SKILL.md) only |
| Builder UX, submissions, form list, validation engine, BE | `generalPurpose` subagent |
| Locate patterns in customForms | `explore` first if needed |

## Child skills (subagent must read)

| Skill | When |
|-------|------|
| [form-editor-field](../form-editor-field/SKILL.md) | New or changed field module |
| [frontend-redux-api](../frontend-redux-api/SKILL.md) | customForms slice/epics |

## Rules

- [form-editor-fields.mdc](../../rules/form-editor-fields.mdc) — FieldModule contract, render contexts
- [dialog-windows.mdc](../../rules/dialog-windows.mdc), [form-dialogs.mdc](../../rules/form-dialogs.mdc)
- [theme-accent-ui-consistency.mdc](../../rules/theme-accent-ui-consistency.mdc)

## Task categories

| Category | Key paths |
|----------|-----------|
| Builder entry | `pages/FormBuilder/FormBuilderEditor.tsx` |
| Canvas / selection / save | `pages/FormBuilder/VisualFormEditor.tsx` |
| Grid editor | `pages/FormBuilder/components/FormFieldGridEditor.tsx` |
| Field registry | `pages/FormBuilder/fields/registry.ts` |
| Field factory | `pages/FormBuilder/fields/shared/createFieldModule.tsx` |
| Types | `types/formDefinition.ts` |
| Grid/layout | `utils/fieldGridUtils.ts` |
| Fill validation | `utils/validateFormValues.ts` |
| Form list + meta | `pages/CustomFormsPage/`, `hooks/useCustomFormsPage.ts` |
| Appointment fill UX | `components/appointment/` (FillCustomFormDialog, ViewSubmissionDialog, etc.) |
| Shared exports | `shared/components/customForms/` |
| Backend forms | `back-end/routes/companyCustomForms.js`, `models/CompanyCustomForm.js` |
| Backend submissions | `back-end/routes/companyCustomFormSubmissions.js` |

**Routes:** `/system/custom-forms`, `/system/custom-forms/:formId/builder`

## Registered field types (baseline)

`text`, `textarea`, `checkbox`, `radio`, `dropdown`, `date`, `number` — all via `fields/registry.ts`.

**Render contexts:** `editor`, `preview`, `fill` — see `fields/types.ts`, `FormFieldsRenderer.tsx`.

## Deliverables checklist

```
- [ ] Task scoped to customForms / FormBuilder (not generic app forms)
- [ ] FormFieldType + FieldModule + registry (if new field)
- [ ] validateFormValues updated (if fill/submit rules change)
- [ ] fieldGridUtils used for layout/z-index (no duplicate grid logic)
- [ ] Builder UX changes preserve dirty/save/preview flows
- [ ] Form meta validation (schemas/customFormValidation.ts) if meta UI changes
- [ ] Redux/services/backend aligned if CRUD or submissions change
- [ ] Appointment integration via shared/components/customForms if fill UX changes
- [ ] type-check + lint pass
- [ ] Manual smoke: builder add/configure/save, preview, fill + submit (appointment if applicable)
```

## Subagent prompt template

```
Deliver form-editor work under front-end/src/features/customForms/ (and back-end companyCustomForm* if needed).

READ FIRST:
- .cursor/skills/form-editor-delivery/SKILL.md
- .cursor/skills/form-editor-field/SKILL.md (if field work)
- .cursor/rules/form-editor-fields.mdc

REFERENCE:
- Field factory: pages/FormBuilder/fields/shared/createFieldModule.tsx
- Canvas: pages/FormBuilder/VisualFormEditor.tsx
- Fill validation: utils/validateFormValues.ts

TASK:
<builder UX, new field, form list, fill/submissions, validation, backend>

CONSTRAINTS:
- FieldModule: editor + preview + fill contexts where applicable
- Layout via fieldGridUtils only
- Backend Joi must match formDefinition types

RETURN: files changed, checklist status, manual test steps, blockers.
```

**Subagent type:** `generalPurpose`

## Verification

```bash
cd front-end && npm run type-check && npm run lint
cd back-end && node scripts/verifyDatabase.js   # if schema changed
```

## Subagent handoff (required)

- **Files:** all created/changed paths
- **Checklist:** each deliverable done / skipped / blocked
- **Tests:** builder, preview, fill/submit steps as applicable
- **Blockers:** e.g. appointment page changes outside customForms
