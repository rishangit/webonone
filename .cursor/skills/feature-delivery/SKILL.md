---
name: feature-delivery
description: Delivers full-stack features from docs/specs through front-end feature modules, back-end routes/models, and verification. Use when implementing a new feature, following a spec in docs/specs/, or building FE+BE changes together.
---

# Feature Delivery

End-to-end workflow for new domain features in this monorepo.

## 1. Read the spec

- Find or create spec under `docs/specs/<version>/<feature>.md`
- Note: API shapes, UI screens, RBAC, migration needs, acceptance criteria

## 2. Back-end (if needed)

Follow [backend-structure.mdc](../../rules/backend-structure.mdc), [backend-api-routes.mdc](../../rules/backend-api-routes.mdc), [backend-database-scripts.mdc](../../rules/backend-database-scripts.mdc):

- [ ] Model in `back-end/models/`
- [ ] Routes in `back-end/routes/` + register in `server.js`
- [ ] Joi validation + auth guards
- [ ] Versioned migration in `back-end/scripts/<version>/` if schema changes
- [ ] Wire migration into `initDatabase.js`

## 3. Front-end feature module

Follow [front-end-structure.mdc](../../rules/front-end-structure.mdc):

- [ ] `features/<domain>/` with `components/`, `pages/`, `services/`, `store/`, `hooks/`, `types/`, `schemas/`, `index.ts`
- [ ] API + Redux: follow [frontend-redux-api](../../skills/frontend-redux-api/SKILL.md) ([redux-store-and-epics.mdc](../../rules/redux-store-and-epics.mdc))
- [ ] Wire route in app router / layouts

## 4. UI patterns

Apply scoped rules as you build:

- **Theme & accent** → [theme-accent-ui-consistency.mdc](../../rules/theme-accent-ui-consistency.mdc) — tokens, glass surfaces, no hardcoded palette
- List page → [list-page-shell.mdc](../../rules/list-page-shell.mdc) + related list rules
- Dialogs → [dialog-windows.mdc](../../rules/dialog-windows.mdc) + [form-dialogs.mdc](../../rules/form-dialogs.mdc)
- Cards → [list-card-layout.mdc](../../rules/list-card-layout.mdc); register in showcase if reusable

## 5. Cross-feature boundaries

- No `@/features/A` imports from `@/features/B` — use `@/shared/...` barrels

## 6. Verification

```bash
cd front-end && npm run type-check && npm run lint
cd back-end && node scripts/verifyDatabase.js   # if schema changed
```

Manual smoke test per spec acceptance criteria.

## Progress checklist

```
- [ ] Spec read / updated
- [ ] Backend model + routes (+ migration if needed)
- [ ] Frontend feature module + Redux
- [ ] UI rules applied
- [ ] type-check + lint pass
- [ ] Manual acceptance test
```
