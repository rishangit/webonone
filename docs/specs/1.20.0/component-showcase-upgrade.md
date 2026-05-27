# Component Showcase upgrade — release **1.20.0** specification

This document defines the product and engineering requirements for upgrading the **Component Showcase** (`/showcase` → **`/system/showcase`**) shipped with **version 1.20.0**.

> **Status (v1.2):** Spec only — implementation pending. v1.2 centers the **main product objective**: one screen where system admins see **every production UI building block** together to spot **alignment**, **spacing**, and **theme** inconsistencies without hopping across dozens of feature pages.

---

## 1. Main objective

**Put all system-used UI in one place so design and engineering can review alignment and theme in a single session.**

Today, buttons, inputs, cards, lists, and dialogs are scattered across appointments, services, products, settings, website, and more. Comparing whether two cards use the same glass border, whether destructive red matches the kebab delete item, or whether light/dark/accent tokens break on a specific control requires opening many routes and mentally stitching the picture together.

The upgraded showcase solves that by rendering **the same components the live app uses** (not mocks), grouped by purpose, on one route:

| Review need | How showcase helps |
|-------------|-------------------|
| **UI alignment** | See primary controls, layout controls, cards (grid), and lists (rows) on adjacent tabs — spot padding, typography, icon size, and kebab placement drift side by side. |
| **Theme consistency** | **Global theme + accent toggles** on the Primary tab apply to the **entire showcase session** (all tabs) so light, dark, system, and each accent can be exercised against every demo without re-opening Settings. |
| **Component coverage** | **Catalog** tab lists every documented entry with import path — find gaps (“we use X in production but it’s missing here”). |
| **Regression before release** | System admin walks six tabs after UI changes; mismatches are visible immediately compared to scanning individual feature pages. |

**Success looks like:** a system administrator opens **Component Showcase**, switches theme/accent once, scrolls Catalog → Primary → Controls → Cards → Lists → Dialogs, and can answer: *“Do all our cards share the same hover border? Do all dialogs use the same footer button height? Does this accent break badges on service cards?”* — without leaving the page.

**Non-goals:** replacing QA on real data flows, automated pixel diff, or editing production records from showcase.

---

## 2. Supporting goals (engineering)

These enable the main objective; they are not the primary user story.

1. **Single route** — `/system/showcase` with dashboard + sidebar entry for `SYSTEM_ADMIN` only.
2. **Production fidelity** — real components from `@/shared/components/*` and `@/components/*` with fixture data only (no API).
3. **Complete inventory** — catalog ≥ 45 entries covering primitives, controls, domain cards/lists, and common dialogs.
4. **Maintainable module** — `features/showcase/` per feature contract (§6), not a 1,340-line monolith.
5. **No side effects** — showcase actions toast “demo only”; no Redux writes.

---

## 3. UI alignment & theme review workflows

### 3.1 Recommended review pass (system admin / design QA)

1. Open **Component Showcase** from dashboard Quick Actions.
2. On **Primary controls**, set **theme** (light → dark → system) and each **accent**; note any control that loses contrast or border visibility.
3. Open **Controls** — verify tags, tabs, menus, search, empty state, and pagination match list-page patterns used in production.
4. Open **Cards** — scan grid at `sm` / `md` / `lg` widths; compare card chrome (glass bg, border, hover, badge placement) across appointment, company, staff, space, service, product, user.
5. Open **Lists** — same entities in list mode; confirm row height, avatar size, and kebab alignment match their list pages.
6. Open **Dialogs** — confirm `CustomDialog` footer height (`h-10`), cancel outline, and destructive styling match `.cursor/rules/dialog-windows.mdc` and delete-destructive rule.
7. Use **Catalog** search to jump to a specific component after a bug report (“service card badge wrong in dark mode”).

### 3.2 What to log when issues are found

| Issue type | Example | Where to fix |
|------------|---------|--------------|
| Token drift | Card uses `border-border` instead of `border-[var(--glass-border)]` | Owning feature card component |
| Spacing drift | List row `p-4` vs card `p-6` | Owning `*ListView` / `*CardView` |
| Theme break | Muted text unreadable on glass in light mode | Shared UI or global CSS variables |
| Missing from showcase | New `FooCard` shipped but not in catalog | Add section + catalog row in next showcase PR |

Showcase is the **detection surface**; fixes land in the owning feature or `@/components/ui`, then showcase is updated if a new component shipped.

### 3.3 Theme scope (required behavior)

| Requirement | Detail |
|-------------|--------|
| Global session theme | `currentTheme` / `currentAccentColor` from `router.tsx` must affect **all tabs**, not only Primary. |
| Theme controls location | **Primary** tab hosts the theme/accent picker UI; changing theme there updates the whole page immediately. |
| Persist preference | Showcase does not need its own persistence — it uses the same handlers as the app shell (existing `handleThemeChange` / `handleAccentColorChange`). |
| Visual comparison | Primary tab should show **active theme + accent** labels (badges or text) so reviewers know which combination they are auditing. |

### 3.4 Alignment checklist (copy for release notes / QA)

- [ ] All primary buttons use shared `Button` variants (no raw `<button>` in demos).
- [ ] All form fields use `bg-[var(--input-background)]` and `border-[var(--glass-border)]`.
- [ ] Card grids use `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` where mirroring list pages.
- [ ] Kebab menus use `MoreVertical`, `align="end"`, `bg-popover border-border`.
- [ ] Destructive actions use shared red contract (not one-off oranges).
- [ ] Dialog footers: cancel outline + accent primary, uniform `h-10`.
- [ ] Light and dark: no illegible `text-muted-foreground` on glass surfaces.
- [ ] Each accent color: accent buttons and badges remain readable.

---

## 4. Personas and permissions

| Persona | Role (app) | Showcase access |
|--------|------------|-----------------|
| System / super admin | `SYSTEM_ADMIN` (`0`) | Full access |
| Company owner | `COMPANY_OWNER` (`1`) | **Denied** → `/system/dashboard` |
| Staff | `STAFF_MEMBER` (`2`) | **Denied** |
| End user | `USER` (`3`) | **Denied** |

**Router guard (required):**

```tsx
// app/router.tsx — /system/showcase inside ProtectedRouteWrapper
if (!isRole(user?.role, UserRole.SYSTEM_ADMIN)) {
  return <Navigate to="/system/dashboard" replace />;
}
```

**Back-end:** None for 1.20.0 (static UI).

---

## 5. Related Cursor rules (must comply)

| Rule file | Application |
|-----------|-------------|
| `.cursor/rules/front-end-structure.mdc` | Full feature contract (§6); no `@/features/<other>/...` from showcase (§6.4) |
| `.cursor/rules/code-cleanliness.mdc` | File size, imports, dead code (§7) |
| `.cursor/rules/dialog-windows.mdc` | Dialog demos + footers |
| `.cursor/rules/system-kebab-menu.mdc` | Kebab demos |
| `.cursor/rules/search-input-component.mdc` | Catalog + search demos |
| `.cursor/rules/empty-state-component.mdc` | Empty-state demos |
| `.cursor/rules/list-pages-card-view.mdc` | Cards tab grids |
| `.cursor/rules/delete-destructive-actions.mdc` | Destructive demos |
| `.cursor/rules/version-update-workflow.mdc` | `docs/specs/1.20.0/`; version **1.20.0** on release |

**Not applicable:** webpage-editor addons, Redux epics (no dispatches from showcase).

---

## 6. Feature module contract (`features/showcase/`)

Implementation is **not complete** until every required folder exists and boundaries in §6.4 pass verification.

### 6.1 Required folder tree (canonical)

```
front-end/src/features/showcase/
├── index.ts                      # Public API for app shell only (§6.2)
├── pages/
│   ├── ShowcasePage.tsx          # Route shell: tabs state, theme props, layout (≤120 lines)
│   └── index.ts                  # export { ShowcasePage }
├── components/
│   ├── ShowcasePageHeader.tsx
│   ├── tabs/
│   │   ├── ShowcaseCatalogTab.tsx
│   │   ├── ShowcasePrimaryTab.tsx
│   │   ├── ShowcaseControlsTab.tsx
│   │   ├── ShowcaseCardsTab.tsx
│   │   ├── ShowcaseListsTab.tsx
│   │   ├── ShowcaseDialogsTab.tsx
│   │   └── index.ts
│   ├── sections/                 # One file per domain block (keeps tabs small)
│   │   ├── AppointmentShowcaseSection.tsx
│   │   ├── CompanyShowcaseSection.tsx
│   │   ├── StaffShowcaseSection.tsx
│   │   ├── SpaceShowcaseSection.tsx
│   │   ├── ServiceShowcaseSection.tsx
│   │   ├── SystemServiceShowcaseSection.tsx
│   │   ├── ProductShowcaseSection.tsx
│   │   ├── UserShowcaseSection.tsx
│   │   ├── TagShowcaseSection.tsx
│   │   └── index.ts
│   ├── primitives/             # Primary + controls demos split by concern
│   │   ├── ThemeAccentSection.tsx
│   │   ├── ButtonsSection.tsx
│   │   ├── FormControlsSection.tsx
│   │   ├── MenusSection.tsx
│   │   └── index.ts
│   └── index.ts                  # Re-export tab + section components used internally
├── fixtures/
│   ├── showcaseFixtures.ts       # Typed dummy entities (cards/lists/dialogs)
│   ├── showcaseHandlers.ts       # createShowcaseHandler() → toast noop
│   └── index.ts
├── constants/
│   ├── showcaseCatalog.ts        # SHOWCASE_CATALOG_ENTRIES (§10 source of truth)
│   ├── showcaseTabs.ts           # Tab ids + labels
│   └── index.ts
├── types/
│   ├── showcase.types.ts         # ShowcaseTabId, fixture aliases, section props
│   └── index.ts                  # export * from ./showcase.types
├── hooks/
│   ├── useShowcaseCatalogFilter.ts
│   ├── useShowcaseTabNavigation.ts  # catalog row → switch tab + scroll
│   └── index.ts
├── utils/
│   ├── serviceShowcaseFormatters.ts # Thin wrappers if not in shared/utils
│   └── index.ts
├── services/
│   └── README.md                 # Intentional: no API layer for showcase
├── store/
│   └── README.md                 # Intentional: no Redux slice; do not add epics
├── schemas/
│   └── README.md                 # Intentional: no Yup/Zod unless demo forms added later
└── components/index.ts           # (listed above for clarity)
```

**Allowed showcase-only folders** (not in generic contract, documented here):

| Folder | Purpose |
|--------|---------|
| `fixtures/` | Static demo data only — not `services/` |
| `constants/` | Catalog registry + tab metadata — no runtime config |

**Forbidden:**

- Leaving all UI in `pages/ShowcasePage.tsx` after migration.
- `export ... from '@/features/<other>/...'` placeholder files inside showcase.
- Duplicate implementations of domain cards (inline staff/space/service JSX).

### 6.2 Public API (`features/showcase/index.ts`)

**Export only what the app shell needs:**

```ts
export { ShowcasePage } from "./pages";
export type { ShowcaseTabId } from "./types";
```

**Do not** export internal tabs, sections, or fixtures from the feature root. Router imports:

```ts
import { ShowcasePage } from "@/features/showcase";
// or
import { ShowcasePage } from "@/features/showcase/pages";
```

Both are acceptable for `app/`; prefer **`@/features/showcase`** for consistency with other features.

### 6.3 Layer responsibilities

| Layer | Responsibility | Must not |
|-------|----------------|----------|
| `pages/ShowcasePage.tsx` | Tab state, `TabSwitcher`, pass theme props to `ShowcasePrimaryTab` | Import domain cards directly; render 100+ lines of demo JSX |
| `components/tabs/*` | Compose sections; local UI state for demos | Define fixture objects inline |
| `components/sections/*` | One domain: grid or list + fixtures + handlers | Import from `@/features/tags/...` |
| `components/primitives/*` | Primary/controls demos | Import `@/shared/components/*` |
| `fixtures/` | Data + noop handlers | Call `fetch`, `dispatch`, `navigate` to real routes |
| `constants/showcaseCatalog.ts` | Single catalog array | Contain React components |
| `hooks/` | Filter catalog, tab navigation | Redux selectors |
| `types/` | Props for sections/tabs | Business domain models owned by other features |

### 6.4 Import boundary matrix (mandatory)

| From showcase | Allowed import | Forbidden |
|---------------|----------------|-----------|
| Any file | `@/components/ui/*`, `@/components/common/*` | — |
| Any file | `@/shared/components/*`, `@/shared/types/*`, `@/shared/utils/*` | — |
| Any file | `@/config/environment`, `@/shared/types/user` | — |
| `features/showcase/**` | Relative within showcase (`../fixtures`) | `@/features/appointments/...`, `@/features/tags/...`, etc. |
| `features/showcase/**` | — | `@/features/<other>/` for **any** `other !== showcase` |

**Tag / system service / sales cards:** add or extend **`shared/components/`** barrels (§6.5) before use in showcase.

**Verification (structure):**

```bash
cd front-end
# Must return no matches under features/showcase:
rg "@/features/(appointments|tags|services|staff|spaces|companies|users|sales|products)/" src/features/showcase
npm run type-check
npm run lint
```

### 6.5 Shared barrels to add or extend (prerequisite)

| File | Re-export | Comment in file |
|------|-----------|-----------------|
| `shared/components/services-catalog.ts` | `ServiceCard`, `SystemServiceCard` | One-line: used by showcase + cross-feature |
| `shared/components/tags.ts` | `TagCard` | Same |
| `shared/components/sales.ts` (new) | `SalesCard` | Same |

Showcase **never** imports `SystemServiceCard` from `@/features/services/pages/...`.

### 6.6 Migration completion checklist

Before marking 1.20.0 showcase **done**:

- [ ] All contract folders exist: `components/`, `pages/`, `services/`, `store/`, `hooks/`, `types/`, `schemas/`, `index.ts`
- [ ] `services/`, `store/`, `schemas/` contain **README.md** explaining “intentionally empty” (not blank folders)
- [ ] `pages/ShowcasePage.tsx` **≤ 120 lines**
- [ ] No file under `features/showcase/` imports `@/features/<other>/`
- [ ] Legacy `ShowcasePage.tsx` monolith **deleted** (content moved, not duplicated)
- [ ] No commented-out blocks > 5 lines
- [ ] `rg` boundary check passes (§6.4)
- [ ] `type-check` + `lint` pass

---

## 7. Clean code standards

Apply on every touched file (see **code-cleanliness** rule).

### 7.1 File size and decomposition

| File kind | Max lines (target) | Action if exceeded |
|-----------|-------------------|---------------------|
| `pages/ShowcasePage.tsx` | 120 | Extract to tabs |
| `components/tabs/*.tsx` | 200 | Extract to `sections/` or `primitives/` |
| `components/sections/*.tsx` | 150 | Split grid vs list into two files if needed |
| `fixtures/showcaseFixtures.ts` | 400 | Split per domain: `appointmentFixtures.ts`, etc. |
| `constants/showcaseCatalog.ts` | 300 | Data-only; no JSX |

### 7.2 Imports

- **`@/`** for anything outside the current subfolder (components, shared, config).
- **Relative** only inside the same subtree (e.g. `sections` → `../fixtures`).
- Order: React → third-party → `@/components` → `@/shared` → `@/features/showcase/...` → relative.
- No unused imports; no `any` for fixture shapes — use types from `@/shared/types` or local `showcase.types.ts`.

### 7.3 Naming

| Item | Convention |
|------|------------|
| Tab components | `Showcase{TabName}Tab.tsx` |
| Section components | `{Entity}ShowcaseSection.tsx` |
| Primitive sections | `{Topic}Section.tsx` in `primitives/` |
| Fixtures | `showcase{Entity}` or `SHOWCASE_{ENTITY}_FIXTURES` |
| Handlers | `createShowcaseNoopHandler(label?: string)` in `showcaseHandlers.ts` |
| Section IDs (anchors) | `showcase-{tab}-{entity}` e.g. `showcase-cards-appointment` |

### 7.4 State and side effects

- Tab state: `useState<ShowcaseTabId>` on `ShowcasePage` only (or `useShowcaseTabNavigation`).
- Dialog open flags: local state in `ShowcaseDialogsTab` or per-demo subcomponent.
- **Single toast helper:** `notifyShowcaseOnly()` in `showcaseHandlers.ts` — do not duplicate strings.
- **No** `useEffect` that fetches data.
- **No** `useAppDispatch` in showcase.

### 7.5 Dead code and legacy cleanup

On completion:

1. Remove inline `sampleCompany`, `sampleUser`, etc. from old page.
2. Remove unused `components` tab and duplicate primitive demos.
3. Delete empty dirs; keep README stubs in `services/`, `store/`, `schemas/`.
4. Run `npm run format:check` if project uses Prettier.

### 7.6 `"use client"` directive

Keep **`"use client"`** only on files that use hooks or browser APIs. Pure `fixtures/`, `constants/`, `types/` files: **no** directive.

---

## 8. Route, navigation, and dashboard entry

### 8.1 Canonical route

| Item | Value |
|------|--------|
| Path | `/system/showcase` |
| Legacy | `/showcase` → `<Navigate to="/system/showcase" replace />` |
| Shell | `ProtectedRouteWrapper` + admin guard (§4) |
| Theme | Pass `onThemeChange`, `currentTheme`, `onAccentColorChange`, `currentAccentColor` from `router.tsx` |

**Wiring lives in `app/router.tsx` only** — not in `features/showcase/`.

### 8.2 Dashboard link

**File:** `features/dashboard/pages/Dashboard.tsx` — Quick Actions.

| Field | Value |
|-------|--------|
| Visible | `isRole(user?.role, UserRole.SYSTEM_ADMIN)` only |
| Label | Component Showcase |
| Icon | `LayoutGrid` (Lucide) |
| Action | `navigate('/system/showcase')` |

Dashboard change is a **small, focused diff** in the dashboard feature — showcase does not import `Dashboard`.

### 8.3 Sidebar (required for 1.20.0)

**File:** `layouts/Sidebar.tsx` — `SYSTEM_ADMIN` nav block.

| Field | Value |
|-------|--------|
| id | `showcase` |
| Label | Showcase |
| Icon | `LayoutGrid` |
| Position | After Tags, before Analytics |

**File:** `app/router.tsx` — `handleNavigation` case `showcase` → `/system/showcase`.

---

## 9. Information architecture — tabs

Six tabs via `TabSwitcher` (`@/components/ui/tab-switcher`). Constants in `constants/showcaseTabs.ts`.

| `value` | Label | Component |
|---------|-------|-----------|
| `catalog` | Catalog | `ShowcaseCatalogTab` |
| `primary` | Primary controls | `ShowcasePrimaryTab` |
| `controls` | Controls | `ShowcaseControlsTab` |
| `cards` | Cards | `ShowcaseCardsTab` |
| `lists` | Lists | `ShowcaseListsTab` |
| `dialogs` | Dialogs | `ShowcaseDialogsTab` |

**Header:** `ShowcasePageHeader`

| Field | Copy |
|-------|------|
| Title | **Component Showcase** |
| Subtitle | **Review all system UI in one place — check alignment, spacing, and theme (light / dark / accent) without opening every feature page.** |
| Optional | App version badge from `config.appVersion` |

**Theme & accent:** `ThemeAccentSection` on **Primary** tab; controls must update **global** theme for the full showcase (§3.3).

---

## 10. Catalog (`constants/showcaseCatalog.ts` + `ShowcaseCatalogTab`)

The catalog is the **index of everything the system uses** — the fastest way to confirm a component is represented in the one-place review.

### 10.1 Data shape

```ts
export type ShowcaseCatalogEntry = {
  id: string;
  name: string;
  category: "primary" | "controls" | "cards" | "lists" | "dialogs" | "common";
  importPath: string;       // Display string e.g. "@/components/ui/button"
  tab: ShowcaseTabId;
  sectionId?: string;       // anchor: showcase-cards-appointment
  notes?: string;
};
```

Define **`SHOWCASE_CATALOG_ENTRIES`** in `constants/` — **not** inside a React file. Tab filters/maps this array.

### 10.2 Catalog UI

- `SearchInput` + `useShowcaseCatalogFilter`
- Columns: Name | Category | Import | Tab | Notes
- Row action: `useShowcaseTabNavigation` → set parent tab + `scrollIntoView(sectionId)`

### 10.3 Inventory (minimum counts)

| Category | Count (min) | Source |
|----------|-------------|--------|
| primary | 18 | §11.1 |
| controls | 16 | §11.2 |
| cards | 9 entities | §11.3 |
| lists | 8 entities | §11.4 |
| dialogs | 8 interactive + 3 catalog-only refs | §11.5 |
| common | 5 cross-cutting | CartItemEditorCard, UserRoleBadge, etc. |

**Total catalog rows ≥ 45.** Any production component not listed is a **coverage gap** to close in the same release or a documented exception in `notes`.

---

## 11. Component inventory by tab

Each tab exists so reviewers can compare **like with like** on one screen (alignment) under the **same theme** (consistency).

### 11.1 Primary (`components/primitives/`)

| Demo file | Components |
|-----------|------------|
| `ThemeAccentSection.tsx` | Theme cards, accent swatches |
| `ButtonsSection.tsx` | `Button` variants/sizes/icons/disabled |
| `FormControlsSection.tsx` | `Input`, `Textarea`, `Label`, `Select`, `MultiSelect`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Toggle`, `ToggleGroup` |
| (extend) | `Calendar`, `DatePicker`, `PhoneInput`, `FileUpload`, `InputOTP`, `Progress`, `ProgressBar`, `Skeleton` |

Inputs: `bg-[var(--input-background)] border-[var(--glass-border)]`.

### 11.2 Controls (`components/primitives/` + tags section)

| Section | Components |
|---------|------------|
| `MenusSection.tsx` | `DropdownMenu` kebab per system-kebab-menu |
| Tabs demo | `TabSwitcher` |
| Tags | `TagCard`, `TagSelector` via `@/shared/components/tags` |
| Shell | `Card`, `Badge`, `Avatar`, `Separator`, `Tooltip`, `Breadcrumb`, `Accordion` |
| Lists UX | `SearchInput`, `EmptyState`, `ViewSwitcher`, `Pagination`, `CardTitle` |

### 11.3 Cards tab (`components/sections/` + `ServiceShowcaseSection`)

Each section:

- `id={sectionId}`
- Grid: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Import card from **`@/shared/components/...`**
- Props from `fixtures/`
- Handlers from `createShowcaseNoopHandler()`

| Section file | Component | Shared import |
|--------------|-----------|---------------|
| `AppointmentShowcaseSection.tsx` | `AppointmentCard` | `@/shared/components/appointments` |
| `CompanyShowcaseSection.tsx` | `CompanyCard` | `@/shared/components/companies` |
| `StaffShowcaseSection.tsx` | `StaffCard` | `@/shared/components/staff` |
| `SpaceShowcaseSection.tsx` | `SpaceCard` | `@/shared/components/spaces` |
| `ServiceShowcaseSection.tsx` | `ServiceCard` | `@/shared/components/services-catalog` |
| `SystemServiceShowcaseSection.tsx` | `SystemServiceCard` | `@/shared/components/services-catalog` |
| `ProductShowcaseSection.tsx` | `CompanyProductCard` | `@/shared/components/products-company` |
| `UserShowcaseSection.tsx` | `UserCard` | `@/shared/components/users` |
| `TagShowcaseSection.tsx` | `TagCard` | `@/shared/components/tags` |

Also: `CartItemEditorCard` block, `UserRoleBadge` row (roles 0–3).

**Remove** hand-rolled staff/space/service markup from legacy page.

### 11.4 Lists tab

Same sections with `viewMode="list"` (or list subcomponents). Company: `CompanyListView` in glass `Card` wrapper.

Layout: `space-y-4` (not list-page card grid).

### 11.5 Dialogs tab (`ShowcaseDialogsTab.tsx`)

Split:

- `components/dialog-demos/ShowcaseShellDemos.tsx` — CustomDialog, AlertDialog, Sheet, Popover, RightPanel
- `components/dialog-demos/ShowcaseCommonDialogDemos.tsx` — DeleteConfirmation, UserSelection, SelectMedia, ProductServiceSelection

**CustomDialog footer (compliant):**

```tsx
footer={
  <motion.div className="flex items-center justify-end gap-2">
    <Button variant="outline" className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent" onClick={close}>
      Cancel
    </Button>
    <Button variant="accent" className="h-10" onClick={close}>
      <Save className="w-4 h-4 mr-2" />
      Save
    </Button>
  </motion.div>
}
```

Catalog-only refs (no mount): `BillPreviewDialog`, webpage editor dialogs, `ImageCropDialog` — paths in `showcaseCatalog.ts` with `notes: "See feature X"`.

---

## 12. Fixtures (`fixtures/`)

### 12.1 Files

| File | Contents |
|------|----------|
| `showcaseFixtures.ts` | Re-exports or aggregates domain fixtures |
| `appointmentFixtures.ts` | CONFIRMED, PENDING, CANCELLED |
| `companyFixtures.ts` | Approved company + tags |
| `staffFixtures.ts`, `spaceFixtures.ts`, … | One file per domain when `showcaseFixtures.ts` grows |
| `showcaseHandlers.ts` | `notifyShowcaseOnly`, `createShowcaseNoopHandler` |
| `dialogFixtures.ts` | Users, products, media arrays |

### 12.2 Rules

- IDs: `showcase-{domain}-{n}`
- Dates: anchor `2026-05-18T10:00:00.000Z`
- Typed with interfaces from `@/shared/types` or colocated `Showcase*Fixture` in `types/showcase.types.ts`
- **No** `fetch`, **no** `dispatch`

### 12.3 Example (appointment)

```ts
export const showcaseAppointmentConfirmed = {
  id: "showcase-appt-1",
  patientName: "Alex Rivera",
  date: "2026-05-18T14:00:00.000Z",
  time: "2:00 PM",
  duration: "45 min",
  type: "Skin consultation",
  status: AppointmentStatus.CONFIRMED,
  phone: "+1 (555) 010-2000",
  location: "Treatment Room B",
  staff: { name: "Dr. Sam Chen", specialization: "Dermatology" },
  service: "Skin consultation",
} as const;
```

Service formatters: `utils/serviceShowcaseFormatters.ts` — thin copies from services page utils or future shared extract.

---

## 13. `ShowcasePage` orchestrator (target)

```tsx
// pages/ShowcasePage.tsx — illustrative shape only
export function ShowcasePage({ onThemeChange, currentTheme, onAccentColorChange, currentAccentColor }: ShowcasePageProps) {
  const [activeTab, setActiveTab] = useState<ShowcaseTabId>("catalog");

  return (
    <motion.div className="min-h-screen bg-background p-6 space-y-6">
      <ShowcasePageHeader />
      <TabSwitcher tabs={SHOWCASE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "catalog" && <ShowcaseCatalogTab onNavigate={setActiveTab} />}
      {activeTab === "primary" && (
        <ShowcasePrimaryTab
          theme={{ onThemeChange, currentTheme, onAccentColorChange, currentAccentColor }}
        />
      )}
      {activeTab === "controls" && <ShowcaseControlsTab />}
      {activeTab === "cards" && <ShowcaseCardsTab />}
      {activeTab === "lists" && <ShowcaseListsTab />}
      {activeTab === "dialogs" && <ShowcaseDialogsTab />}
    </motion.div>
  );
}
```

| Legacy | Target |
|--------|--------|
| ~1,340 lines in one file | Orchestrator ≤ 120 lines |
| 4 tabs | 6 tabs |
| Inline samples | `fixtures/` |
| HTML clones | `sections/` + shared cards |
| `/showcase` public | `/system/showcase` + guard |
| `components` tab | Merged into primary/controls |

---

## 14. Theme, accessibility, version

Theme review is a **first-class** requirement, not an add-on.

- Tokens: `bg-background`, `bg-[var(--glass-bg)]`, `border-[var(--glass-border)]`, `text-foreground`, `text-muted-foreground`, `text-[var(--accent-text)]`
- Changing theme/accent on Primary tab re-renders Cards, Lists, Controls, and Dialogs with the new tokens (verify in QA)
- `Label` + `htmlFor` on all form demos
- `aria-label` on icon-only triggers
- `VITE_APP_VERSION` → **1.20.0** on release; optional in `ShowcasePageHeader`

---

## 15. Acceptance criteria

### 15.1 Product (main objective)

1. A system admin can open **one route** and see **all** documented system UI groups (catalog, primary, controls, cards, lists, dialogs) without navigating feature modules.
2. Switching **light / dark / system** and **accent** on Primary tab visibly updates components on **at least one other tab** (e.g. service card + dialog) in the same session.
3. **Cards** and **Lists** tabs show the **same entities** in grid vs row form so alignment differences are obvious (padding, borders, typography, kebab position).
4. **Catalog** search finds any listed component by name and jumps to its tab/section.
5. Reviewer can complete the §3.1 pass in **under ~15 minutes** for a full UI/theme smoke check (excluding deep dialog wizards).

### 15.2 Engineering

1. **Structure:** §6.1 tree exists; §6.6 checklist complete.
2. **Imports:** `rg` finds **zero** `@/features/<other>/` under `features/showcase/`.
3. **Access:** Only `SYSTEM_ADMIN` reaches showcase; others redirected.
4. **Navigation:** Dashboard + sidebar links work.
5. **Fidelity:** Real shared cards/lists; no hand-rolled staff/space/service clones; compliant dialog footer.
6. **Clean code:** No file exceeds §7.1 limits without documented exception.
7. **Tooling:** `npm run type-check` and `npm run lint` pass.

---

## 16. Implementation status

| Area | Status |
|------|--------|
| Spec v1.2 | ✅ |
| Feature folder contract | ⏳ |
| Shared barrels | ⏳ |
| Route + guard | ⏳ |
| Dashboard + sidebar | ⏳ |
| Decompose ShowcasePage | ⏳ |
| Version 1.20.0 bump | ⏳ |

---

## 17. Verification

```bash
cd front-end
rg "@/features/(appointments|tags|services|staff|spaces|companies|users|sales|products)/" src/features/showcase
npm run type-check
npm run lint
npm run format:check
```

**Manual (product):**

1. SYSTEM_ADMIN → dashboard → **Component Showcase**.
2. Set dark + orange accent → visit Cards + Dialogs → confirm tokens apply.
3. Set light + blue accent → repeat → note any component that did not update (fail).
4. Compare appointment card (grid) vs appointment list row — note misaligned spacing if any.
5. Complete §3.4 checklist; log issues per §3.2.
6. Company owner → `/system/showcase` → redirect.

**Structure audit:**

```bash
# Required folders (adjust path for Windows)
ls src/features/showcase/components src/features/showcase/pages src/features/showcase/fixtures \
   src/features/showcase/constants src/features/showcase/types src/features/showcase/hooks \
   src/features/showcase/utils src/features/showcase/services src/features/showcase/store \
   src/features/showcase/schemas
```

---

## 18. Out of scope

- Storybook / visual regression
- Backend API
- Runtime fixture editing
- Full webpage editor dialog mounts

---

*Document version: 1.2 — main objective: single-place review of all system UI for alignment and theme consistency; workflows in §3; engineering contract in §6–§7.*
