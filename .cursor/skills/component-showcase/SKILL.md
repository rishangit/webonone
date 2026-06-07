---
name: component-showcase
description: Registers reusable card and list row components in the system Component Showcase at /system/showcase. Use when adding a new Card or ListView component, materially changing card visuals, or when the user mentions component showcase registration.
---

# Component Showcase Registration

Card/list **layout and styling** first: [card-list-item-ui](../card-list-item-ui/SKILL.md).  
Full rule: [component-showcase.mdc](../../rules/component-showcase.mdc). Route: `/system/showcase` (SYSTEM_ADMIN).

## When to register

**Do:** new reusable `*Card` / list row on list pages; significant visual/API changes to existing production cards.

**Skip:** one-off wizard/detail UI, private feature-only components, compact inline pickers.

## Workflow

### 1. Shared export first

Showcase renders the **same component** the app uses:

- Promote cross-feature cards to `@/shared/components/<domain>/`
- Showcase imports from `@/shared/...`, not `@/features/<other>/...`

### 2. Fixture data

Add fixtures in `front-end/src/features/showcase/fixtures/showcaseFixtures.ts` (prefix ids `showcase-`, no API calls).

### 3. Section component

Create `front-end/src/features/showcase/components/sections/<Domain>ShowcaseSection.tsx`:

- Props: `ShowcaseSectionProps` (`sectionId`, `viewMode`)
- `ShowcaseSectionHeading` + grid/list layout
- Grid: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- List: `space-y-4`
- Handlers: `createShowcaseNoopHandler()` — no Redux writes

Reference: `SpaceShowcaseSection.tsx`

### 4. Wire tabs

- Export from `components/sections/index.ts`
- Add to `ShowcaseCardsTab.tsx` (`sectionId="showcase-cards-<slug>"`, `viewMode="grid"`)
- Add to `ShowcaseListsTab.tsx` (`sectionId="showcase-lists-<slug>"`, `viewMode="list"`)

### 5. Catalog

Add entry to `constants/showcaseCatalog.ts` (`id`, `name`, `importPath`, `tab: "cards"`, `sectionId`).

### 6. Related rules

- Grid breakpoints: [list-pages-card-view.mdc](../../rules/list-pages-card-view.mdc)
- Row actions: [system-kebab-menu.mdc](../../rules/system-kebab-menu.mdc)
- Status badges: [status-badges.mdc](../../rules/status-badges.mdc)

## Verification

```bash
cd front-end && npm run type-check && npm run lint
```

Manual: `/system/showcase` → Cards + Lists tabs; switch theme on Primary.

## Progress checklist

```
- [ ] Component exported from production path (shared/ if cross-feature)
- [ ] Fixture data added
- [ ] ShowcaseSection created
- [ ] Cards + Lists tabs wired
- [ ] showcaseCatalog entry added
- [ ] type-check + lint pass
- [ ] Manual showcase review
```
