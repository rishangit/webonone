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
| [dialog-windows.mdc](dialog-windows.mdc) | `front-end/src/**/*.{ts,tsx}` | [form-dialogs.mdc](form-dialogs.mdc) |
| [form-dialogs.mdc](form-dialogs.mdc) | `front-end/src/features/**/*Dialog*.tsx` | [dialog-windows.mdc](dialog-windows.mdc) |
| [search-input-component.mdc](search-input-component.mdc) | `front-end/src/**/*.{ts,tsx}` | [list-page-shell.mdc](list-page-shell.mdc) |
| [system-kebab-menu.mdc](system-kebab-menu.mdc) | `front-end/src/**/*.{ts,tsx}` | [list-card-layout.mdc](list-card-layout.mdc) |
| [delete-destructive-actions.mdc](delete-destructive-actions.mdc) | always | kebab destructive items |
| [empty-state-component.mdc](empty-state-component.mdc) | `front-end/**/*.tsx` | [list-page-shell.mdc](list-page-shell.mdc) |
| [list-pages-card-view.mdc](list-pages-card-view.mdc) | `front-end/src/features/**/pages/**/*.{ts,tsx}` | [list-loading-skeletons.mdc](list-loading-skeletons.mdc) |
| [list-page-shell.mdc](list-page-shell.mdc) | `front-end/src/features/**/pages/**/*.{ts,tsx}` | search, empty-state, card-view, pagination |
| [list-card-layout.mdc](list-card-layout.mdc) | `front-end/src/**/*{Card,ListView}*.tsx` | kebab-menu, component-showcase |
| [list-loading-skeletons.mdc](list-loading-skeletons.mdc) | `front-end/src/features/**/pages/**/*.{ts,tsx}` | list-pages-card-view |
| [status-badges.mdc](status-badges.mdc) | `front-end/src/**/*.{ts,tsx}` | `shared/utils/statusBadges.ts` |
| [component-showcase.mdc](component-showcase.mdc) | Card/List/Showcase paths | `.cursor/skills/component-showcase/` |

## Domain-specific

| Rule | Globs |
|------|-------|
| [webpage-editor-addons.mdc](webpage-editor-addons.mdc) | `front-end/src/features/website/pages/WebpageEditor/**/*` |

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

1. [list-page-shell.mdc](list-page-shell.mdc) — page layout, filters, pagination
2. [search-input-component.mdc](search-input-component.mdc) — search field
3. [list-pages-card-view.mdc](list-pages-card-view.mdc) — grid breakpoints
4. [list-loading-skeletons.mdc](list-loading-skeletons.mdc) — loading state
5. [empty-state-component.mdc](empty-state-component.mdc) — no-data state
6. [list-card-layout.mdc](list-card-layout.mdc) — card/list row anatomy
7. [component-showcase.mdc](component-showcase.mdc) — register reusable cards
