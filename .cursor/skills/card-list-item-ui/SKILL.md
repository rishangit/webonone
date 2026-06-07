---
name: card-list-item-ui
description: Builds list-page card and list-row UI using ListCardLayout shells — images, glass borders, kebab alignment, labels/values, accent icons, price, tags, spacing, and no duplicate fields. Use when creating or changing *Card, *ListView, or *CardView components on list pages.
---

# Card & List Item UI

Build list-page cards with shared primitives from `@/components/common/ListCardLayout` and `@/components/common/CardKebabTrigger`. One component per entity with `viewMode: "grid" | "list"` when possible.

Related rules: [list-card-layout.mdc](../../rules/list-card-layout.mdc), [system-kebab-menu.mdc](../../rules/system-kebab-menu.mdc), [theme-accent-ui-consistency.mdc](../../rules/theme-accent-ui-consistency.mdc), [status-badges.mdc](../../rules/status-badges.mdc). Showcase registration: [component-showcase](../component-showcase/SKILL.md).

## Do not use cards within cards

- **One outer shell only:** a single `@/components/ui/card` with `LIST_CARD_GRID_SHELL` or `LIST_CARD_LIST_SHELL`.
- **Do not** nest another `Card`, glass panel, or bordered box inside the list card body for sections (details, tags, price, footer).
- Use **layout divs** (`flex`, `grid`, `space-y-*`, `ListCardDetailGrid`, `ListCardDetailDivider`) — not nested cards.
- Exception: `EmptyState` inside a parent detail `Card` may use `className="!p-8 border-0 shadow-none bg-transparent"` (see [empty-state-component.mdc](../../rules/empty-state-component.mdc)).

## Do not duplicate values within a card

Each fact appears **once per card** (per `viewMode` branch). Before finishing, scan header, hero overlays, detail grids, footers, and tag rows for the same label or value.

| Field | One slot only |
|-------|----------------|
| **Title / name** | Header (`h3` or `ListCardDetailsHeader` `title`) — not repeated as a detail field |
| **Description** | Header `description` or body paragraph — not both |
| **Status** | Hero overlay (grid) **or** `ListCardDetailsHeader` `status` (list) — not also in a detail grid |
| **Price (same amount)** | Pick **one**: grid hero overlay **or** grid inline meta **or** `ListCardPriceFooter` — never two slots for the same price |
| **Tags** | List: `ListCardDetailsHeader` `tags` only. Grid: one tag block below body — not header + body |
| **Contact** | One row per channel (`ListCardContactEmail`, `ListCardContactPhone`, etc.) — no duplicate email/phone columns |

**Allowed:** different metrics for the same domain (e.g. unit **price** in footer vs **revenue** in a detail field). **Not allowed:** repeating the identical formatted value in two visible places.

When a hero overlay already shows price or status, omit that field from the body/detail section for that view.

## Shell, borders, radius

| Token / export | Use |
|----------------|-----|
| `LIST_CARD_GRID_SHELL` | Grid card outer class on `<Card>` |
| `LIST_CARD_LIST_SHELL` | List row outer class on `<Card>` |
| `rounded-xl` | From `@/components/ui/card` — do not override |
| `border border-[var(--glass-border)]` | Default border (in shell) |
| `hover:border-[var(--accent-border)]` | Hover border (in shell) |
| `bg-[var(--glass-bg)]` | Glass surface (in shell) |
| `hover:bg-accent/50` | Hover fill (in shell) |

Do **not** hardcode `bg-gray-*`, `border-gray-*`, or hex borders. Match [theme-accent-ui-consistency.mdc](../../rules/theme-accent-ui-consistency.mdc).

## Images & media

### Grid hero (`variant="grid"`)

- Height: `LIST_CARD_HERO_HEIGHT_CLASS` (`h-48`) on the hero wrapper.
- **Photo cover:** full-bleed `object-cover`; optional `group-hover:scale-105 transition-transform duration-300`.
- **Logo / avatar hero:** `ListCardBlurredMedia` — blurred background + gradient overlay + centered `Avatar` (`CARD_LIST_AVATAR_CLASS`).
- **List media column:** `ListCardMediaColumn` + `ListCardCoverImage` or `ListCardBlurredMedia`; image is `absolute inset-0 h-full w-full object-cover`.

### Status on media

- Grid: status badge **`absolute top-3 left-3`** on the hero (or via domain `*Status` component).
- Price on dark hero (optional): **`absolute bottom-3 right-3`** with `CARD_PRICE_OVERLAY_TEXT_CLASS`.

### Placeholders

- Use domain utils / `formatAvatarUrl` / ui-avatars fallback — same pattern as `CompanyCardView`, `SpaceImage`.

## 3-dot menu alignment

Use `CardKebabTrigger` + `@/components/ui/dropdown-menu`. Full menu spec: [system-kebab-menu.mdc](../../rules/system-kebab-menu.mdc).

| Surface | Placement | Trigger |
|---------|-----------|---------|
| **Grid** (on photo/hero) | `CardGridKebabSlot` → `absolute top-3 right-3 z-10` | `variant="overlay"` — dark glass trigger on media |
| **List** (header row) | `ListCardDetailsHeader` → `actions` prop, trailing | `variant="default"` — muted icon on light content |
| **List** (never on media overlay) | Kebab stays in content header, not over the thumbnail | `triggerVariant="default"` on `*Actions` |

- `CardGridKebabSlot`: optional `status` chips **left of** kebab in the same top-right cluster.
- `ListCardDetailsHeader`: title left; **`status` + kebab** grouped top-right via `ListCardHeaderActions` (`flex shrink-0 items-center gap-2`).
- Always **`stopPropagation`** on trigger and `DropdownMenuContent`; card `onClick` must ignore `button, [role="menuitem"]`.

## Labels, values & alignment

### Header block (`ListCardDetailsHeader`)

- Title: `text-lg font-semibold text-foreground truncate`.
- Description: `text-sm text-muted-foreground line-clamp-2`, `mt-1`.
- Row: `flex items-start justify-between gap-3` — title block `min-w-0 flex-1`, trailing actions `shrink-0`.

### Detail fields (`ListCardDetailField`)

Default row: `flex min-w-0 items-center gap-2 text-sm`

| Part | Classes |
|------|---------|
| Icon | `h-4 w-4 shrink-0 text-[var(--accent-text)]` |
| Label | `shrink-0 text-muted-foreground` |
| Value | `min-w-0 truncate font-medium text-foreground` |
| Empty | `"—"` for missing scalar values |

### Detail grids

- `ListCardDetailGrid` / `LIST_CARD_DETAIL_GRID_CLASS`: `grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3`.
- Optional `ListCardDetailDivider` between upper/lower blocks (`border-t border-[var(--glass-border)]/40 my-3`).
- Contact row: `ListCardContactEmail`, `ListCardContactPhone` in `ListCardContactGrid`.

### List row layout

```
[ListCardMediaColumn w-56 min-h-48]  [ListCardContent p-6 flex-col]
  media (cover / blurred)              ListCardDetailsHeader
                                       ListCardDetailGrid (+ divider)
                                       ListCardPriceFooter (optional)
```

- Content column: `flex flex-1 min-w-0 min-h-48 flex-col justify-start p-6`.
- Price footer: `mt-auto flex justify-end pt-3` via `ListCardPriceFooter`.

### Grid body

- Below hero: `div className="p-6"` — title, description, inline meta, tags.
- Inline meta (grid): compact `flex items-center gap-4 text-sm` rows with accent icons (see `ServiceInfo` grid branch).

## Icons with accents

- **Detail / meta icons:** `text-[var(--accent-text)]` (see `ListCardDetailField`, `Clock` in `ServiceInfo`).
- **Do not** use accent color for destructive or status semantics — status uses [status-badges.mdc](../../rules/status-badges.mdc); delete uses destructive tokens.
- **Emphasized values** (e.g. revenue): `[&_span:last-child]:font-semibold [&_span:last-child]:text-[var(--accent-text)]` on the field wrapper.

## Price

| Context | API | Classes |
|---------|-----|---------|
| List row footer | `ListCardPriceFooter label={formatPrice(...)}` | `CARD_PRICE_TEXT_CLASS` |
| Grid inline meta | `<span className={CARD_PRICE_TEXT_CLASS}>` | accent text, not a badge |
| Grid hero overlay | bottom-right on dark media | `CARD_PRICE_OVERLAY_TEXT_CLASS` (+ `drop-shadow-sm`) |

Shared: `text-xl font-semibold leading-tight text-[var(--accent-text)] tabular-nums`.

- **One price slot per grid card:** hero overlay **xor** inline meta — if overlay shows `formatPrice(item.price)`, do not repeat price in `*Info` / detail rows below.
- **Do not** wrap price in `Badge` unless an existing domain card already does for a non-price semantic.
- Use domain `formatPrice` helpers; keep currency formatting out of layout primitives.

## Tags

- Pass tag chips to **`ListCardDetailsHeader` `tags` prop** (not deprecated `ListCardTagsRow`).
- Chip: `Badge variant="secondary" className="text-xs"` with inline style from entity color:
  - `backgroundColor: \`${color}20\``
  - `color: tag.color`
  - `borderColor: \`${color}40\``
- Optional emoji/icon: `<span className="mr-1">{tag.icon}</span>` before name.
- Show **max 3** tags; overflow: `+N` as `Badge variant="outline"` or `text-xs text-muted-foreground`.
- Container: `flex flex-wrap items-center gap-1` under description (`mt-2` in header).
- Grid-only tag block below body content: `flex flex-wrap gap-1 mb-4` (see `ServiceTags`).

## Grid vs list checklist

```
- [ ] Single Card shell (LIST_CARD_GRID_SHELL | LIST_CARD_LIST_SHELL)
- [ ] viewMode switch: *CardView + *ListView or one component with branches
- [ ] Glass borders/tokens — no nested Card
- [ ] Grid kebab: CardGridKebabSlot + overlay trigger
- [ ] List kebab: ListCardDetailsHeader actions + default trigger
- [ ] ListCardDetailField / grids for structured fields
- [ ] Tags via ListCardDetailsHeader.tags (list) or domain *Tags (grid)
- [ ] Price via ListCardPriceFooter (list) or one CARD_PRICE_* slot (grid) — not duplicated
- [ ] No duplicate title, description, status, price, tags, or contact fields in the same card
- [ ] Card click guarded from menu/button targets
- [ ] Reusable? → shared/ + component-showcase skill
```

## Reference implementations

| File | Pattern |
|------|---------|
| `ListCardLayout.tsx` | Primitives, price classes, detail fields |
| `CardKebabTrigger.tsx` | Shell classes, kebab variants |
| `CardGridKebabSlot.tsx` | Grid top-right kebab + status |
| `ServiceCardView.tsx` / `ServiceListView.tsx` | Price overlay + footer, tags, detail grids |
| `CompanyListView.tsx` | Blurred media, contact grid, tags in header |
| `SpaceListView.tsx` | Tags in header, list media cover |
| `UserCard.tsx` | Grid + list in one file |

## Verification

```bash
cd front-end && npm run type-check && npm run lint
```

Manual: list page → toggle card/list view; light/dark + accent in Settings; confirm kebab, tags, price, and fields align with references above.
