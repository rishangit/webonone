---
name: webpage-editor-addon
description: Creates new WebpageEditor content addons following the image addon pattern — types, AddonModule, registry, CustomDialog edit UI. Use when adding a WebpageEditor addon, content block addon, or editing addons under WebpageEditor/addons/.
---

# WebpageEditor Addon

Full rule: [webpage-editor-addons.mdc](../../rules/webpage-editor-addons.mdc). Reference implementation: `front-end/src/features/website/pages/WebpageEditor/addons/image/ImageAddon.tsx`.

## Workflow

### 1. Types (`WebpageEditor/types.ts`)

- [ ] Add literal to `ContentAddonType`
- [ ] Define `<Name>ContentAddonData extends ContentAddonBaseData`
- [ ] Extend `ContentAddonData` union
- [ ] Include `companyId`, `contentElementId` on saved data

### 2. Module folder

Create `addons/<name>/<Name>Addon.tsx` exporting `<name>AddonModule`:

| Field | Requirement |
|-------|-------------|
| `type` | Matches `ContentAddonType` |
| `label` / `description` | Short strings for Add addon dialog |
| `createDefaultAddon` | `id: nanoid(10)`, defaults with `companyId`, `contentElementId` |
| `RenderComponent` | Placeholder when data missing; use `themeTextSettings` if styling applies |
| `EditComponent` | `CustomDialog` + react-hook-form + yup; reset on `open` |

### 3. Edit dialog

Follow [dialog-windows.mdc](../../rules/dialog-windows.mdc) + [form-dialogs.mdc](../../rules/form-dialogs.mdc):

- `@/components/ui` inputs only
- Save builds `{ ...addon, data: { ...fields, companyId, contentElementId } }`
- On save: `onSave(updatedAddon)` + `onOpenChange(false)`

### 4. Registry

Import module in `addons/registry.ts` and append to `modules` array.

### 5. Layout / z-index

Do not duplicate grid layout logic — use `addonGridUtils` for `AddonGridLayout` and `computeAddonDisplayZIndex`.

## Verification

```bash
cd front-end && npm run type-check && npm run lint
```

Manual: open WebpageEditor → Add addon → configure → save → verify render on canvas and published page if applicable.

## Progress checklist

```
- [ ] ContentAddonType + data interface added
- [ ] AddonModule created (Render + Edit)
- [ ] Registered in addons/registry.ts
- [ ] CustomDialog edit form validates and saves
- [ ] type-check + lint pass
- [ ] Manual editor smoke test
```
