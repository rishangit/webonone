---
name: form-editor-field
description: Creates new FormBuilder field modules following text/checkbox/radio patterns — FormFieldType, FieldModule, registry, CustomDialog settings, fill validation. Use when adding a form field type, FormBuilder field, or editing fields under FormBuilder/fields/.
---

# FormBuilder Field Module

Full rule: [form-editor-fields.mdc](../../rules/form-editor-fields.mdc). Reference: `front-end/src/features/customForms/pages/FormBuilder/fields/shared/createFieldModule.tsx`.

## Workflow

### 1. Types (`features/customForms/types/formDefinition.ts`)

- [ ] Add literal to `FormFieldType`
- [ ] Extend `FormField` only if the type needs new persisted fields

### 2. Module

Create or extend in `fields/shared/createFieldModule.tsx` (or `fields/<name>/` when large):

| Field | Requirement |
|-------|-------------|
| `type` | Matches `FormFieldType` |
| `label` / `description` | Short strings for Add field dialog |
| `createDefaultField` | `id: nanoid(10)`, default `layout` (row 1, col 1, span 2×6) |
| `RenderComponent` | Handle `editor`, `preview`, `fill` contexts |
| `EditComponent` | `FieldSettingsDialog` or custom `CustomDialog` + yup |

**Shortcuts:** text-like → `buildTextModule`; radio/dropdown → `ChoiceRender`; checkbox → copy `checkboxFieldModule`.

### 3. Edit dialog

Follow [dialog-windows.mdc](../../rules/dialog-windows.mdc) + [form-dialogs.mdc](../../rules/form-dialogs.mdc):

- `@/components/ui` inputs only
- Reset on `open`; save merges into `{ ...field, ...updates }`
- On save: `onSave(updatedField)` + `onOpenChange(false)`

### 4. Registry

Import module in `fields/registry.ts` and append to `modules` array.

### 5. Fill validation

If users submit the field, add rules to `features/customForms/utils/validateFormValues.ts`.

### 6. Layout / z-index

Use `fieldGridUtils` — do not duplicate grid layout or stacking logic.

## Verification

```bash
cd front-end && npm run type-check && npm run lint
```

Manual: FormBuilder → Add field → configure → save form → preview → fill (appointment dialog) if applicable.

## Progress checklist

```
- [ ] FormFieldType (+ FormField extras if needed)
- [ ] FieldModule created (Render + Edit, all contexts)
- [ ] Registered in fields/registry.ts
- [ ] validateFormValues updated (if fill/submit applies)
- [ ] type-check + lint pass
- [ ] Manual builder + fill smoke test
```
