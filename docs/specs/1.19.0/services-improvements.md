# Services improvements — release **1.19.0** specification

This document defines the product and engineering requirements for the **services** feature set shipped with **version 1.19.0**, aligned with existing app architecture, Cursor rules, and the current implementation under `front-end/src/features/services/` and `back-end/` (models, routes, migration `back-end/scripts/1.19.0/migrateCompanyServicesSchema.js`).

> **Status (v1.3):** Most of the spec has landed (system wizard tags + gallery reorder + Schedule & status step, system-service picker with **Add system service**, `ProductServiceSelectionDialog` `productsOnly` + `excludeProductIds`, 5-tab detail page). This update adds explicit role behavior for **super admin + admin** tab management and **company owner/user overview totals**. The **company wizard step 3 row UI** still needs to migrate to **`CartItemEditorCard`** with the **combined product + service total** and the **shared destructive remove icon** — see **§6.4** and **§10**.

---

## 1. Goals

1. **System administrators** can maintain a **system services catalog** (shared templates) through a **wizard dialog** that follows project dialog standards.
2. **Company owners** add company services by **choosing a system service** (catalog pattern mirrors “add system product to company”), with an escape hatch to **create a new system service** from the picker, then **edit** company and catalog entries via the same wizard patterns.
3. **Service detail** becomes the primary place to **view** structured information and **edit** specific sections (basic, gallery, products & pricing) without a monolithic single edit form.
4. UI stays consistent with **glass / accent theme tokens** and shared components (no one-off raw dialogs or ad-hoc search fields where standards exist).

---

## 2. Personas and permissions

| Persona | Role (app) | Capabilities |
|--------|------------|----------------|
| Super / system admin | `SYSTEM_ADMIN` (role level `0`) | CRUD **system** services (catalog wizard), full catalog visibility. |
| Admin (company-side) | `STAFF_MEMBER` (role level `2`) | Can open service detail, view all tabs, and use per-tab edit actions for service updates. |
| Company owner | `COMPANY_OWNER` (role level `1`) | Pick system service → company service wizard; edit company service; **create system services** from the picker footer (same as the system product picker). |
| Company end user | `USER` (role level `3`) | View service detail; in **Overview** can see linked products pricing breakdown (`products subtotal + service price = service total`). |

**Permission contract (matches the product flow):** the backend `POST /system-services` and `PUT /system-services/:id` endpoints require `requirePermission('manage_company')` which maps to role level `≤ 1` — i.e. **company owner and above**. The picker footer **Add New System Service** button is therefore **always visible** in `SelectSystemServiceDialog` (no front-end role gate), mirroring `AddProductToCompanyDialog`’s **Add New System Product** button.

**Verification model (company owner submissions land unverified):**

- **`SYSTEM_ADMIN` (role level `0`)** — create / update system services with full control over `isVerified`. New entries default to **`isVerified: true`** unless the payload explicitly says otherwise.
- **`COMPANY_OWNER` (role level `1`)** — may create system services from the picker footer; the **backend always forces `isVerified: false`** on POST regardless of payload, and **silently drops** `isVerified` from PUT payloads. A system administrator must later verify the entry (via the SYSTEM_ADMIN-only edit path) before it carries the verified badge.
- **Front-end UX** — `SystemCatalogWizard` shows a subtle glass notice when opened by a non-admin (“This catalog entry will be submitted as unverified…”). The redux epic toast for `createSystemServiceSuccess` differentiates on the returned `isVerified` flag: verified entries say **“System service created successfully!”**, unverified entries say **“System service submitted. A system admin will review and verify it.”**

Newly created entries land in the shared catalog and become selectable in the picker immediately because the picker refetches via `catalogRefreshKey`.

---

## 3. Related Cursor rules (must comply)

Apply these for every UI and structure change in this feature:

| Rule file | What to follow |
|-----------|----------------|
| `.cursor/rules/dialog-windows.mdc` | **`CustomDialog`** only; visible header + footer; **Next / Back / Cancel / Save** in **footer** only; wizard = **single** centered **`w-1/2`** step progress bar; uniform footer button height **`h-10`**; cancel outline + primary accent styling. |
| `.cursor/rules/system-kebab-menu.mdc` | Tab-level **actions** use **`DropdownMenu`** + **`MoreVertical`** on `Button variant="ghost" size="icon"` with **`stopPropagation`** where rows/cards are clickable; **`align="end"`**, `className="bg-popover border-border"` on content. |
| `.cursor/rules/search-input-component.mdc` | Any **search** in pickers/lists: **`@/components/common/SearchInput`**. |
| `.cursor/rules/empty-state-component.mdc` | Primary empty catalog / empty lists: **`EmptyState`** from `@/components/common/EmptyState`. |
| `.cursor/rules/front-end-structure.mdc` | Services code stays in **`front-end/src/features/services/`**; cross-feature consumption only via **`@/shared/...`** barrels; app shell imports from feature `index.ts` where appropriate. |
| `.cursor/rules/code-cleanliness.mdc` | **`@/`** imports; remove dead code; run **`npm run type-check`** and **`npm run lint`** in `front-end` before merge. |
| `.cursor/rules/delete-destructive-actions.mdc` | Delete / destructive menu items and buttons use the shared destructive red contract. |

---

## 4. Folder structure (canonical)

### 4.1 Front-end — feature module

```
front-end/src/features/services/
  components/
    ServiceWizard/           # Wizards (system catalog + company)
      components/            # ServiceWizardHeader, WizardProgress, WizardFooter, ServiceWizardImageGrid, …
      steps/                 # SystemBasicStep, SystemImagesStep, … Company* steps
      stepDefinitions.ts
      types.ts
      ServiceWizardDialog.tsx
      CompanyServiceWizard.tsx
      SystemCatalogWizard.tsx
    SystemServiceWizardDialog.tsx   # Thin shell if needed for routing by role
    ServiceCatalogSearchCard.tsx    # Picker cards (if extracted)
  pages/
    ServicesPage/            # Company services list
    SystemServices/          # System catalog list (admin)
    ServiceDetail/
      ServiceDetailPage.tsx
      ServiceDetailHeader.tsx
      overview/
      gallery/
      statistics/
      basic/                   # NEW: read-only + edit entry points per spec
      products-pricing/        # NEW: product list card + edit
  services/                  # API clients (services.ts, systemServices.ts)
  store/
  utils/                       # serviceMedia, serviceProductPricing, …
  index.ts                     # Public exports for app/router
```

### 4.2 Back-end (reference)

- Models: `Service`, `CompanyService`, related links to products / media (as per `migrateCompanyServicesSchema.js` and current routes).
- Routes: `services.js`, `systemServices.js` (align payloads with wizard steps).

### 4.3 Specs (this document)

```
docs/specs/1.19.0/
  services-improvements.md    # This file
```

---

## 5. Reusable components and references

| Purpose | Component / module | Path / notes |
|--------|-------------------|--------------|
| Dialog shell | `CustomDialog` | `@/components/ui/custom-dialog` |
| Wizard header / progress / footer | Existing service wizard pieces | `features/services/components/ServiceWizard/components/` — align with **`AppointmentWizard`** / **`WizardProgress`** patterns for consistency. |
| Image upload (crop / progress) | Shared file upload | `@/components/ui/file-upload` (used by system product dialogs and `SystemImagesStep`); do **not** duplicate upload logic. |
| Gallery grid display | `ServiceWizardImageGrid` | `ServiceWizard/components/ServiceWizardImageGrid.tsx` — extend for **reorder** (drag handles or move up/down) per §6.2. |
| Search in catalog picker | `SearchInput` | `@/components/common/SearchInput` |
| Product (+ service) picker grid | `ProductServiceSelectionDialog` | `@/components/common/ProductServiceSelectionDialog.tsx` — use **`selectionMode="productsOnly"`** + **`excludeProductIds`** in company wizard step 3. |
| **Linked product list row** | `CartItemEditorCard` | `@/components/common/CartItemEditorCard.tsx` — the **same card** used by **POS (`POSSalesPage`)** and **`AppointmentBillingDialog`**. Re-use for the products list rendered inside **company wizard step 3** so add-product UI stays identical across POS, billing, and service editor. |
| System → company catalog UX reference | `AddProductToCompanyDialog` | `features/products/pages/CompanyProducts/AddProductToCompanyDialog.tsx` — **pattern reference** for paginated catalog, footer **“Add system …”**, nested create dialog. |
| Row / tab actions | Kebab menu | `.cursor/rules/system-kebab-menu.mdc` — mirror **`AppointmentCardHeader`**. |
| Empty states | `EmptyState` | `@/components/common/EmptyState` |
| Tabs on detail | `TabSwitcher` | `@/components/ui/tab-switcher` (existing on `ServiceDetailPage`) |

---

## 6. Functional specifications

### 6.1 System admin — **system service catalog wizard**

**Entry:** System services page (or equivalent) — “Add service” opens `ServiceWizardDialog` with `catalog="system"` (see `ServiceWizardDialog.tsx` permission gate).

**Container:** `CustomDialog` + footer-only navigation (see `SystemCatalogWizard.tsx` as baseline).

**Steps (required shape for 1.19.0):**

| Step | Title (suggested) | Fields / behavior |
|------|-------------------|-------------------|
| **1** | Basics | **Service name** (required), **Description**, **Tags** (multi-select; reuse the same tag loading / selector patterns as system products—e.g. `fetchTagsRequest`, tag chips—keep types in feature `types` / services layer). |
| **2** | Gallery | Add/remove images via **shared file upload**; **reorder** gallery (first image = **default / primary** thumbnail); surface copy: “First image is the primary.” |
| **3** | Schedule & status | **Duration** (minutes, integer > 0 when set), **Status** (active / inactive mapped to `isActive` or dedicated field per API). |

**Note on catalog pricing:** If the backend retains **default price** for catalog services, it may remain in API payloads but **optional** in UI, or moved to a later step—**do not** remove backend fields without a migration; UI spec prioritizes **duration + status** on step 3 per product ask.

**Validation:** Step 1 cannot advance without name; step 2 optional images; step 3 validates numeric duration when not empty.

---

### 6.2 Gallery reordering (system + company wizards)

- **Order** is persisted as **array order** in stored `images` (or explicit `sortOrder` if model prefers—array order is simplest and matches “first = default”).
- UI: drag-and-drop **or** explicit “Move up / Move down” controls accessible and keyboard-friendly; must work with **`ServiceWizardImageGrid`** evolution (either enhance grid or wrap with `@dnd-kit` if project already uses it—**search repo before adding dependency**).
- **Primary** badge on index `0` (already hinted in `ServiceWizardImageGrid`).

---

### 6.3 Company owner — **add company service**

**Flow:**

1. User chooses “Add service” on company services page.
2. **`SelectSystemServiceDialog`** (built on `CustomDialog`) lists **system catalog** services with **`SearchInput`** and infinite scroll — visual parity with `AddProductToCompanyDialog`. The service list renders directly on the dialog body (no extra wrapper card around the grid); each row is its own selectable `Card`.
3. **Footer (left → right, right-aligned):**
   - **Cancel** (outline)
   - **Add New System Service** (outline, **always visible**, mirrors **Add New System Product** in the product picker) — opens a **nested** `SystemServiceWizardDialog` (`mode="create"`). On save the new catalog entry is created via `createSystemServiceRequest` and the picker refetches its list by bumping `catalogRefreshKey`; the user remains in the picker with the fresh entry available to select.
   - **Continue** (accent primary, disabled until a row is selected) — closes the picker and opens **`CompanyServiceWizard`** prefilled with the chosen catalog row.
4. On select + Continue: **`CompanyServiceWizard`** customizes company-specific data; **Edit** later reopens the **full wizard** with **prefilled** steps.

**Footer button visibility rationale:** matching `AddProductToCompanyDialog`, the **Add New System Service** affordance has no front-end role gate. Authorization is enforced by the backend (`manage_company`, role level `≤ 1`); a user without permission will see the API reject the request and surface a toast via the existing error pipeline. Do **not** reintroduce a `canCreateCatalog` prop on the picker.

**Edit:** Editing a company service **reloads the wizard** in `mode="edit"` with `initialCompanyService` (or equivalent prop) — same pattern as system edit in `SystemCatalogWizard` `useEffect` hydration.

---

### 6.4 Company wizard — **step 3: products used for the service**

#### 6.4.1 Picker (add product)

- Replace plain `Select`-only UX (`CompanyProductsStep`) with **`ProductServiceSelectionDialog`** for choosing **company products** linked to the service.
- Use **`selectionMode="productsOnly"`** (no product/service switch), **`excludeProductIds`** to hide already-linked rows, and a wizard-friendly **`title`** / **`description`** override.
- Dialog opens from a single **“Add product”** button at the top of the linked-products list; **`onSelectProduct`** appends a new row.
- Keep **`ProductServiceSelectionDialog`** in `@/components/common` — extend props in place without breaking **`AppointmentBillingDialog`** / POS consumers.

#### 6.4.2 Linked product list — **reuse `CartItemEditorCard`**

Use the **same component** as **POS (`POSSalesPage`)** and **`AppointmentBillingDialog`**: **`@/components/common/CartItemEditorCard`**. This guarantees the **add-product row** in the service wizard looks and behaves identically to the cart row in POS.

**Mapping from the wizard’s `defaultProducts` row to card props** (per row, derived from `totals.rows`):

| `CartItemEditorCard` prop | Value |
|---------------------------|-------|
| `id` | `row.companyProductId` |
| `type` | `"product"` |
| `name` | `product?.name` (`availableProducts` lookup) |
| `description` | `product?.description` |
| `image` | `formatAvatarUrl(product.imageUrl)` when present |
| `quantity` | `row.quantity` (parsed positive integer) |
| `unitPrice` | `getCompanyProductDefaultUnitPrice(product)` (existing helper in `serviceProductPricing.ts`) |
| `discount` | `row.discount` (new optional field, default `0`) |
| `formatCurrency` | the wizard’s `formatCurrency` |
| `onRemove(id)` | remove row by `companyProductId` |
| `onQuantityChange(id, qty)` | update `row.quantity` (`Math.max(1, qty)`) |
| `onDiscountChange(id, disc)` | update `row.discount` (clamped `0–100`) |
| `quantityMin` | `1` |

**Rules:**

- **Do not** rebuild a custom grid/`Select` row; reuse `CartItemEditorCard` to keep visual parity with POS.
- The wizard does **not** allow swapping the linked product after the row is added — to change a product, **remove and re-add** via the picker. (`CartItemEditorCard` already has no product-swap control; this matches POS.)
- The card always renders **Quantity / Price / Discount / Total** on one row — accept the discount input here too. If product discounts are not desired for services, set `discount: 0` and ignore changes; do **not** style-hide internal card elements.
- Add a `discount?: number` field to **`DefaultProductRow`** (default `0`) so the wizard can round-trip the value. Persisted shape is **engineering choice**: either save `discount` in `defaultProducts` JSON if backend already tolerates extra keys, or drop it at save time and keep it as in-wizard UI state only. Either is acceptable as long as it is consistent.

#### 6.4.3 Remove product — common delete icon & destructive style

- The card already uses the **system delete icon** (`Trash2` from `lucide-react`) and the **shared destructive style** (`text-red-500` / hover `text-red-600`) consistent with **`.cursor/rules/delete-destructive-actions.mdc`** — keep the **same** affordance; do not introduce a different remove icon (no plain `X` text button, no `Minus`).
- Triggered via **`onRemove(id)`** on the card; the button is an icon-only **`Button variant="ghost" size="icon"`** so it aligns with other remove controls across the app.

#### 6.4.4 Totals — **product price + service price**

Step 3 must show a clear **breakdown** plus a **combined total**:

| Line | Source |
|------|--------|
| **Products subtotal** | Sum of **row totals** from each `CartItemEditorCard` — i.e. `quantity * unitPrice * (1 - discount/100)` per row, equivalent to the formula inside `CartItemEditorCard` (`totalPrice`). |
| **Service price** | The **`price`** field on this step (existing input). |
| **Service total** | **Products subtotal + Service price** — this is the value the wizard surfaces as the “service total”. |

Render the breakdown inside a single **glass surface** (`bg-[var(--glass-bg)] border-[var(--glass-border)]`):

```text
Products subtotal      $ 25.00
Service price          $ 40.00
────────────────────────────────
Service total          $ 65.00   ← text-[var(--accent-text)], bold
```

**Notes:**

- Replace the existing **`totals.productsTotal`** memo so it accounts for **row discount** when present (matches the card’s on-screen total). If discount stays out of scope, the formula reduces to `quantity * unitPrice`.
- Expose **`serviceTotal = productsSubtotal + Number(price)`** as a memoized value.
- Currency formatting comes from the **`formatCurrency`** helper already passed through the wizard.
- This breakdown is **display only**; the persisted `price` on the service remains the **service price** field (no schema change on the price column).

#### 6.4.5 Validation

- Step 3 must enforce: **at least one linked product**, **duration ≥ 1**, **service price ≥ 0**.

---

### 6.5 Service detail page — **tabs and per-tab edit**

**Tabs (left-to-right suggested):**

| Tab | Content |
|-----|---------|
| **Overview** | Summary card(s): name, description, tags, duration, status, primary image, key metrics hooks; booking CTA for non-managers (existing `AppointmentWizard` trigger pattern). |
| **Statistics** | Charts / tables / KPIs (existing `ServiceStatisticsTab`); respect `canViewPricingDetails` for sensitive rows. |
| **Basic** | Name, description, tags, duration, status (read-only layout with **same** fields as wizard step 1 / company basics). |
| **Gallery** | Existing `ServiceGalleryTab` behavior; ensure parity with wizard gallery rules (order, primary). |
| **Products & pricing** | **Card** (or card list) showing **products used** for the service (thumbnail, name, qty, line price if applicable); use **glass** surfaces (`bg-[var(--glass-bg)]`, `border-[var(--glass-border)]`). |

**Per-tab edit (super admin / admin / owner):**

- Each tab panel header (or tab row region) exposes a **kebab** menu: **Edit this section** (opens **wizard** or **section-scoped `CustomDialog`** — **preferred:** open `CompanyServiceWizard` / `SystemCatalogWizard` with **`initialStepIndex`** or dedicated small dialogs that only touch that slice, as long as **`CustomDialog`** + footer rules hold).
- **Minimum viable:** “Edit” opens full wizard on the matching step; **ideal:** section dialog to reduce context switch—product decision.
- Actions must be visible on **Overview**, **Statistics**, **Basic**, **Gallery**, and **Products & pricing** tabs for these roles.

**Read-only roles:** no kebab; read-only tabs.

**Overview totals for company owner/user:**

- In `Overview`, show a pricing breakdown card using linked products and service price:
  - **Products subtotal** = sum of linked product row totals (`qty * unit price * (1 - discount/100)`).
  - **Service price** = current service price.
  - **Service total** = `products subtotal + service price`.
- This overview card is required for **`COMPANY_OWNER`** and **`USER`** logins.

---

## 7. UI and theme alignment

Use existing tokens consistently:

- Surfaces: `bg-background`, `bg-[var(--glass-bg)]`, `border-[var(--glass-border)]`
- Text: `text-foreground`, `text-muted-foreground`, accents `text-[var(--accent-text)]`, `variant="accent"` buttons
- Inputs: `bg-[var(--input-background)]`, `SERVICE_WIZARD_INPUT_SURFACE` / same as wizard constants
- Dialog: default `CustomDialog` padding; **`noContentPadding` / `disableContentScroll`** only where wizard already does full-bleed layout (see `SystemCatalogWizard`)
- **Destructive icons / buttons (remove product, delete service):** match **`.cursor/rules/delete-destructive-actions.mdc`** — Lucide **`Trash2`** + the shared red token (`text-red-500` hover `text-red-600`) on a ghost icon button, identical to **`CartItemEditorCard`**.

---

## 8. API / state expectations (high level)

- **System services:** CRUD + list + search offset/limit; include **tag ids** (`tagIds` on write, `tags[]` on read), **images[]**, **defaultDuration**, **isActive** (and optional `defaultPrice` if retained). List response includes `count` for pagination.
- **Company services:** Link to `systemServiceId` (set when adding from the picker, omitted when creating ad-hoc on the system side); company overrides for name, description, images, duration, products, pricing. `defaultProducts` array carries `{ companyProductId, quantity }` (and optional `discount` per **§6.4.2**).
- **Redux:** Continue `fetchServiceRequest` / slices under `features/services/store`; after mutations, refresh `currentService` and list epics. After **detail-page edit**, `updateServiceRequest` already updates `currentService` via the slice — no extra refetch required.

Exact DTO shapes should live next to `features/services/services/*.ts` and stay in sync with `back-end` routes.

---

## 9. Acceptance criteria (testable)

1. **System admin** can create a catalog service with **name, description, tags**, **ordered gallery** (first = primary), **duration and status**, without console errors; item appears in system list and company picker.
2. **Company owner** can open picker, search with **`SearchInput`**, select a service, complete company wizard including **at least one** product picked via **`ProductServiceSelectionDialog`** when required by validation.
3. **Step 3 linked products** render with **`CartItemEditorCard`** (identical to POS / billing) — same image, name, quantity input, unit price, and **`Trash2`** remove button using the shared destructive red.
4. **Step 3 totals** show **Products subtotal + Service price = Service total**, formatted via `formatCurrency`, on a single glass surface; the total updates live when quantity or service price changes.
5. **Add system service** from picker footer opens catalog wizard; after save, new service is selectable without full page reload (list refresh).
6. **Edit** reopens wizard with fields hydrated.
7. **Service detail** shows all five tabs; **super admin/admin/owner** see per-tab kebab actions on **Overview**, **Statistics**, **Basic**, **Gallery**, and **Products & pricing**, and edits persist after refresh.
8. **Company owner/user** sees overview pricing breakdown with **Products subtotal + Service price = Service total** calculated from linked products and current service price.
9. **`npm run type-check`** and **`npm run lint`** pass in `front-end`.

---

## 10. Implementation status (current codebase vs this spec)

### 10.1 Already implemented

| Area | Implementation |
|------|----------------|
| System wizard step 1 — **tags** | `SystemBasicStep` now has `TagSelector`; payload includes `tagIds`; backend `routes/systemServices.js` accepts/returns `tagIds` + tags. |
| System wizard step 3 — **Schedule & status** | `SystemDefaultsStep` shows Duration + Status first; suggested default price kept as optional secondary block. |
| Gallery reorder | `ServiceWizardImageGrid` exposes optional `onMoveUp` / `onMoveDown`; `SystemImagesStep` and `CompanyImagesStep` wire the controls; first image stays primary. |
| System service picker for company add | `SelectSystemServiceDialog.tsx` — paginated list, `SearchInput`, list renders directly on the dialog body (no outer wrapper card), footer **Add New System Service** **always visible** (matches `AddProductToCompanyDialog`), `catalogRefreshKey` bumps after nested create so the picker refetches. Backend `POST /system-services` enforces `manage_company` so company owners and above can submit. |
| Unverified submission flow for company owners | Backend POST forces `isVerified: false` for any non-`SYSTEM_ADMIN` caller; PUT silently drops `isVerified` for the same callers. `SystemCatalogWizard` shows an inline “submitted as unverified” notice when the current user isn’t a system admin. `createSystemServiceEpic` switches the success toast to **“System service submitted. A system admin will review and verify it.”** when the API returns `isVerified: false`. |
| Picker dialog props | `ProductServiceSelectionDialog` gained `selectionMode="productsOnly"`, `excludeProductIds`, `title`, `description` overrides. |
| Company wizard `systemServiceId` link | `CompanyServiceWizard` stores `linkedSystemServiceId`, prefills from `selectedSystemCatalog`, sends `systemServiceId` on save; `initialStepIndex` supported. |
| Per-tab kebab edits | `ServiceDetailTabToolbar` + 5-tab `ServiceDetailPage` (Overview, Statistics, Basic, Gallery, Products & pricing); kebab opens wizard at the matching step for managers. |
| Read-only tabs | `basic/ServiceBasicTab.tsx`, `products-pricing/ServiceProductsPricingTab.tsx`. |
| Backend list count | `Service.countAll()` + system services route returns `count` for pagination. |

### 10.2 Still pending (target for this spec)

| Area | Current snapshot | Spec delta |
|------|------------------|------------|
| Company products step — row UI | `CompanyProductsStep` still renders a 12-col grid with `Select` + plain `X` text button | **Replace with `CartItemEditorCard`** per **§6.4.2** (same as POS). |
| Remove product affordance | Plain `X` text button in `<Button variant="outline" size="sm">` | Use the card’s built-in **`Trash2`** ghost icon button (shared destructive red) per **§6.4.3**. |
| Step 3 totals | Only “Default products total” shown | Show **Products subtotal + Service price = Service total** breakdown per **§6.4.4**. |
| `DefaultProductRow` shape | `{ companyProductId, quantity }` | Add optional `discount?: number` (default `0`) per **§6.4.2** so card discount input round-trips in UI. |
| Picker → wizard duplication risk | After the picker `onSelectProduct`, the wizard appends a row | Continue to use `excludeProductIds` + `appendProductById` (already in place) to prevent duplicates. |

---

## 11. Verification commands

From repo root:

```bash
cd front-end
npm run type-check
npm run lint
```

Back-end (when touching scripts):

- Confirm `back-end/scripts/initDatabase.js` includes **1.19.0** service migrations per `.cursor/rules/version-update-workflow.mdc`.

---

*Document version: 1.3 — adds explicit role behavior for **super admin/admin** full tab actions on Service Detail and **company owner/user** overview pricing breakdown, while keeping the existing 1.19.0 pending step-3 migration items in **§10.2**.*
