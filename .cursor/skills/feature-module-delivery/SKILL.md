---
name: feature-module-delivery
description: Orchestrates delivery of CRUD feature modules — list pages, detail pages, cards, list views, search, filters, dialogs, Redux/API. Use when creating or extending a domain module with list/detail UI, or when delegating module work to a Task subagent.
disable-model-invocation: true
---

# Feature Module Delivery

Orchestrator for new or extended **domain modules** (list + detail + cards + dialogs + data layer). Delegates implementation to a Task subagent; composes existing granular skills.

## When to delegate vs inline

| Scope | Action |
|-------|--------|
| One card/list row tweak | Parent + [card-list-item-ui](../card-list-item-ui/SKILL.md) |
| Full module (3+ surfaces or BE+FE) | Launch `generalPurpose` subagent with prompt below |
| Unknown reference module | `explore` first, then `generalPurpose` |

## Child skills (subagent must read)

| Skill | When |
|-------|------|
| [feature-delivery](../feature-delivery/SKILL.md) | Full-stack scaffold, spec, backend |
| [frontend-redux-api](../frontend-redux-api/SKILL.md) | Services, slice, epics, store registration |
| [card-list-item-ui](../card-list-item-ui/SKILL.md) | `*Card`, `*ListView`, `*CardView` |
| [component-showcase](../component-showcase/SKILL.md) | Reusable card registered in showcase |

## Rules chain (list page, in order)

1. [list-page-shell.mdc](../../rules/list-page-shell.mdc)
2. [search-input-component.mdc](../../rules/search-input-component.mdc)
3. [list-pages-card-view.mdc](../../rules/list-pages-card-view.mdc)
4. [list-loading-skeletons.mdc](../../rules/list-loading-skeletons.mdc)
5. [empty-state-component.mdc](../../rules/empty-state-component.mdc)
6. [list-card-layout.mdc](../../rules/list-card-layout.mdc)
7. [dialog-windows.mdc](../../rules/dialog-windows.mdc) + [form-dialogs.mdc](../../rules/form-dialogs.mdc)
8. [theme-accent-ui-consistency.mdc](../../rules/theme-accent-ui-consistency.mdc)
9. [system-kebab-menu.mdc](../../rules/system-kebab-menu.mdc)

Also: [front-end-structure.mdc](../../rules/front-end-structure.mdc), [redux-store-and-epics.mdc](../../rules/redux-store-and-epics.mdc). Backend: [backend-structure.mdc](../../rules/backend-structure.mdc), [backend-api-routes.mdc](../../rules/backend-api-routes.mdc).

## Reference implementations

| Pattern | Path |
|---------|------|
| Clean list → detail → dialogs | `front-end/src/features/spaces/` |
| Rich filters, wizards, tabbed detail | `front-end/src/features/services/` |
| List hook + detail + add dialog | `front-end/src/features/staff/` |
| Minimal form dialog | `front-end/src/features/tags/pages/TagFormDialog.tsx` |
| Canonical list shell | `front-end/src/features/users/pages/UsersPage/` |

## Deliverables checklist

```
- [ ] Spec read or scoped (docs/specs/ if exists)
- [ ] Backend model + routes + Joi (+ migration if schema changes)
- [ ] features/<domain>/ scaffold (components, pages, services, store, hooks, types, schemas, index.ts)
- [ ] API service + Redux slice + epics + store registration
- [ ] Page hook (search debounce, filters, pagination, dialog state)
- [ ] List page shell (header, SearchInput, filters, skeleton, EmptyState, grid/list, Pagination)
- [ ] *Card + *ListView (+ *CardView if split); kebab actions
- [ ] Add/edit CustomDialog (+ form-dialogs RHF/yup); delete destructive pattern
- [ ] Detail page route + header (+ tabs if needed)
- [ ] Routes wired in app router
- [ ] Showcase registration (if reusable card)
- [ ] type-check + lint pass
- [ ] Manual smoke: search, filters, add/edit, delete, grid/list, pagination, detail nav
```

## Subagent prompt template

```
Deliver a feature module in front-end/src/features/<domain>/ (and back-end if needed).

READ FIRST:
- .cursor/skills/feature-module-delivery/SKILL.md
- .cursor/skills/feature-delivery/SKILL.md
- .cursor/skills/frontend-redux-api/SKILL.md
- .cursor/skills/card-list-item-ui/SKILL.md
- List-page rules chain in .cursor/rules/README.md

REFERENCE MODULES:
- Structure: front-end/src/features/spaces/
- Complexity: front-end/src/features/services/
- Form dialog: front-end/src/features/tags/pages/TagFormDialog.tsx

ENTITY / SCREENS:
<name, list page, detail page, dialogs, API operations>

CONSTRAINTS:
- No @/features/A importing @/features/B — use @/shared/ barrels
- SearchInput with onDebouncedChange (~500ms)
- Cross-feature boundaries per front-end-structure.mdc

RETURN: files changed, checklist status, manual test steps, blockers.
```

**Subagent type:** `generalPurpose` (implementation); `explore` if reference module unknown.

## Verification

```bash
cd front-end && npm run type-check && npm run lint
cd back-end && node scripts/verifyDatabase.js   # if schema changed
```

## Subagent handoff (required)

- **Files:** all created/changed paths
- **Checklist:** each deliverable done / skipped / blocked
- **Tests:** manual steps run or recommended
- **Blockers:** items needing parent or another domain orchestrator
