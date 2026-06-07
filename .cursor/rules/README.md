# Cursor Rules Index

Rules live in `.cursor/rules/*.mdc`. **Always-on** rules apply to every chat; **scoped** rules load when matching files are in context.

## Global (alwaysApply)

| Rule | Purpose | Verification |
|------|---------|--------------|
| [general.mdc](general.mdc) | Focused diffs, follow conventions | Area-specific rules |
| [code-cleanliness.mdc](code-cleanliness.mdc) | `@/` aliases, dead code, empty folders | `cd front-end && npm run type-check && npm run lint` |
| [delete-destructive-actions.mdc](delete-destructive-actions.mdc) | OKLCH red for delete/destructive UI | Visual review |
| [cursor-rules.mdc](cursor-rules.mdc) | How to add/edit rules | — |
| [version-update-workflow.mdc](version-update-workflow.mdc) | Version bump + release checklist | Git + package.json versions |

## Front-end architecture

| Rule | Globs | Related |
|------|-------|---------|
| [front-end-structure.mdc](front-end-structure.mdc) | `front-end/src/**/*.{ts,tsx}` | [redux-store-and-epics.mdc](redux-store-and-epics.mdc) |
| [redux-store-and-epics.mdc](redux-store-and-epics.mdc) | `front-end/**/store/**/*.ts` | [frontend-redux-api skill](../skills/frontend-redux-api/SKILL.md) |

## Front-end UI

| Rule | Globs | Related |
|------|-------|---------|
| [theme-accent-ui-consistency.mdc](theme-accent-ui-consistency.mdc) | `front-end/src/**/*.{ts,tsx}` | globals.css, Settings accent picker |
| [dialog-windows.mdc](dialog-windows.mdc) | `front-end/src/**/*.{ts,tsx}` | [form-dialogs.mdc](form-dialogs.mdc) |
| [form-dialogs.mdc](form-dialogs.mdc) | `front-end/src/features/**/*Dialog*.tsx` | [dialog-windows.mdc](dialog-windows.mdc) |
| [search-input-component.mdc](search-input-component.mdc) | `front-end/src/**/*.{ts,tsx}` | [list-page-shell.mdc](list-page-shell.mdc) |
| [pagination-component.mdc](pagination-component.mdc) | `front-end/src/**/*.{ts,tsx}` | [list-page-shell.mdc](list-page-shell.mdc) |
| [system-kebab-menu.mdc](system-kebab-menu.mdc) | `front-end/src/**/*.{ts,tsx}` | [list-card-layout.mdc](list-card-layout.mdc) |
| [delete-destructive-actions.mdc](delete-destructive-actions.mdc) | always | kebab destructive items |
| [empty-state-component.mdc](empty-state-component.mdc) | `front-end/**/*.tsx` | [list-page-shell.mdc](list-page-shell.mdc) |
| [list-pages-card-view.mdc](list-pages-card-view.mdc) | `front-end/src/features/**/pages/**/*.{ts,tsx}` | [list-loading-skeletons.mdc](list-loading-skeletons.mdc) |
| [list-page-shell.mdc](list-page-shell.mdc) | `front-end/src/features/**/pages/**/*.{ts,tsx}` | search, empty-state, card-view, [pagination-component](pagination-component.mdc) |
| [list-card-layout.mdc](list-card-layout.mdc) | `front-end/src/**/*{Card,ListView}*.tsx` | kebab-menu, component-showcase |
| [list-loading-skeletons.mdc](list-loading-skeletons.mdc) | `front-end/src/features/**/pages/**/*.{ts,tsx}` | list-pages-card-view |
| [status-badges.mdc](status-badges.mdc) | `front-end/src/**/*.{ts,tsx}` | `shared/utils/statusBadges.ts` |
| [component-showcase.mdc](component-showcase.mdc) | Card/List/Showcase paths | `.cursor/skills/component-showcase/` |

## Domain-specific

| Rule | Globs | Related |
|------|-------|---------|
| [webpage-editor-addons.mdc](webpage-editor-addons.mdc) | `front-end/src/features/website/pages/WebpageEditor/**/*` | [website-editor skill](../skills/website-editor/SKILL.md) |
| [form-editor-fields.mdc](form-editor-fields.mdc) | `front-end/src/features/customForms/pages/FormBuilder/**/*` | [form-editor-field skill](../skills/form-editor-field/SKILL.md) |
| [media-upload-delete.mdc](media-upload-delete.mdc) | Upload/Media/Gallery paths, `fileUploadService`, upload routes | [media-upload-delete skill](../skills/media-upload-delete/SKILL.md) |

## Back-end

| Rule | Globs | Related |
|------|-------|---------|
| [backend-structure.mdc](backend-structure.mdc) | `back-end/**/*.js` | backend-api-routes |
| [backend-api-routes.mdc](backend-api-routes.mdc) | `back-end/routes/**/*.js` | backend-structure |
| [backend-database-scripts.mdc](backend-database-scripts.mdc) | `back-end/scripts/**/*.js` | [version-update-workflow.mdc](version-update-workflow.mdc) |

## Project skills

Multi-step workflows: see [`.cursor/skills/README.md`](../skills/README.md).

## List page rule chain

When building or refactoring a list page, read in order:

1. [list-page-shell.mdc](list-page-shell.mdc) — page layout, filters
2. [search-input-component.mdc](search-input-component.mdc) — search field
3. [pagination-component.mdc](pagination-component.mdc) — server-side pagination
4. [list-pages-card-view.mdc](list-pages-card-view.mdc) — grid breakpoints
5. [list-loading-skeletons.mdc](list-loading-skeletons.mdc) — loading state
6. [empty-state-component.mdc](empty-state-component.mdc) — no-data state
7. [list-card-layout.mdc](list-card-layout.mdc) — card/list row anatomy ([card-list-item-ui skill](../skills/card-list-item-ui/SKILL.md))
8. [component-showcase.mdc](component-showcase.mdc) — register reusable cards
