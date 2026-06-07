---
name: website-editor
description: Website builder and WebpageEditor — webpages, themes, headers, footers, media library, content addons, publishing, companyWeb APIs. Use when delivering website features, adding WebpageEditor addons, or delegating website tasks to a Task subagent.
---

# Website Editor

Orchestrator for `features/website/` and `companyWeb*` backend. Composes media, card, and Redux skills; includes the WebpageEditor addon workflow inline.

## Domain boundary

**Website:** `companyWeb*` services, `WebpageEditor`, `/system/web/*`, `/web/:companyId/*`, `features/website/`.

**Not website:** company record external URL (`features/companies/`); entity gallery uploads via `fileUploadService` (use [media-upload-delete](../media-upload-delete/SKILL.md) for API choice).

## When to delegate vs inline

| Scope | Action |
|-------|--------|
| Single addon | Follow **Content addon workflow** below |
| Single card tweak | [card-list-item-ui](../card-list-item-ui/SKILL.md) only |
| New list surface, editor change, theme flow, BE route | `generalPurpose` subagent |
| Unfamiliar editor subsystem | `explore` first, then `generalPurpose` |

## Child skills (subagent must read)

| Skill | When |
|-------|------|
| [media-upload-delete](../media-upload-delete/SKILL.md) | Media library upload/delete |
| [card-list-item-ui](../card-list-item-ui/SKILL.md) | WebpageCard, ThemeCard, MediaCard |
| [frontend-redux-api](../frontend-redux-api/SKILL.md) | Pages/themes Redux (headers/footers/media often direct service) |
| [component-showcase](../component-showcase/SKILL.md) | Register shared website cards |

## Rules

- [webpage-editor-addons.mdc](../../rules/webpage-editor-addons.mdc) — editor/addons
- List pages: same chain as feature modules ([rules README list-page chain](../../rules/README.md))
- [dialog-windows.mdc](../../rules/dialog-windows.mdc), [form-dialogs.mdc](../../rules/form-dialogs.mdc)
- [media-upload-delete.mdc](../../rules/media-upload-delete.mdc)
- [theme-accent-ui-consistency.mdc](../../rules/theme-accent-ui-consistency.mdc)

## Task categories

| Category | Key paths |
|----------|-----------|
| Admin hub | `pages/WebsitePage.tsx` |
| Webpages list + meta | `pages/WebpagesPage/`, `pages/WebpageFormPage.tsx` |
| Visual editor | `pages/WebpageEditor/WebpageEditor.tsx`, `VisualWebEditor.tsx` |
| Content addons | `pages/WebpageEditor/addons/`, `registry.ts`, `addonGridUtils.ts` |
| Themes | `pages/ThemePage/`, `ThemeAddDialog/` |
| Headers / footers | `pages/HeadersPage/`, `pages/FootersPage/`, `HeaderWebEditor.tsx`, `FooterWebEditor.tsx` |
| Media library | `pages/MediaPage/`, `services/companyWebMedia.ts` |
| Public site | `pages/PublicWebsiteLayout.tsx`, `pages/PublicWebPage.tsx` |
| Shared cards | `shared/components/website.ts` |
| Backend | `back-end/routes/companyWeb*.js`, models `CompanyWeb*` |

## Reference implementations

| Pattern | Path |
|---------|------|
| Addon module | `pages/WebpageEditor/addons/image/ImageAddon.tsx` |
| Text addon (simpler) | `pages/WebpageEditor/addons/text/TextAddon.tsx` |
| Webpages list | `pages/WebpagesPage/WebpagesPage.tsx` |
| Redux pages/themes | `store/companyWebPagesSlice.ts`, `companyWebThemesSlice.ts` |

## Content addon workflow

Full rule: [webpage-editor-addons.mdc](../../rules/webpage-editor-addons.mdc). Reference: `pages/WebpageEditor/addons/image/ImageAddon.tsx`.

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

### Addon checklist

```
- [ ] ContentAddonType + data interface added
- [ ] AddonModule created (Render + Edit)
- [ ] Registered in addons/registry.ts
- [ ] CustomDialog edit form validates and saves
- [ ] type-check + lint pass
- [ ] Manual: WebpageEditor → Add addon → configure → save → verify canvas + published page
```

## Deliverables checklist

```
- [ ] Task scoped to website domain (not companies URL field)
- [ ] Services/routes/models updated if API changes
- [ ] Redux slice/epics (pages/themes only) or direct service pattern (headers/footers/media)
- [ ] List page rules applied (if list surface)
- [ ] Editor/addon rules applied (if WebpageEditor)
- [ ] Media uses companyWebMediaService + correct folder paths
- [ ] Public render tested if content/publish path changed
- [ ] Showcase updated if shared card changed
- [ ] type-check + lint pass
- [ ] Manual smoke per category (list CRUD, editor save, addon, theme, media, public page)
```

## Subagent prompt template

```
Deliver website feature work under front-end/src/features/website/ (and back-end companyWeb* if needed).

READ FIRST:
- .cursor/skills/website-editor/SKILL.md
- Child skills per task category (media-upload-delete, card-list-item-ui, etc.)
- .cursor/rules/webpage-editor-addons.mdc (if editor/addon work)

REFERENCE:
- Editor: pages/WebpageEditor/VisualWebEditor.tsx
- Addon: pages/WebpageEditor/addons/image/ImageAddon.tsx
- Hub: pages/WebsitePage.tsx

TASK:
<specific website task — pages, editor, addon, theme, header/footer, media, publish>

CONSTRAINTS:
- Addon grid/z-index via addonGridUtils — no duplicate layout logic
- Media library: companies/{companyId}/web/media/ via companyWebMediaService
- Do not conflate with features/companies/ external URL field

RETURN: files changed, checklist status, manual test steps, blockers.
```

**Subagent type:** `generalPurpose`; `explore` for unfamiliar editor areas.

## Verification

```bash
cd front-end && npm run type-check && npm run lint
cd back-end && node scripts/verifyDatabase.js   # if schema changed
```

## Subagent handoff (required)

- **Files:** all created/changed paths
- **Checklist:** each deliverable done / skipped / blocked
- **Tests:** editor save, list CRUD, media upload/delete, public render as applicable
- **Blockers:** cross-domain items (e.g. needs new CRUD module elsewhere)
