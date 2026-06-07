---
name: frontend-redux-api
description: Adds or extends front-end API services, Redux slice actions, and redux-observable epics with global store registration. Use when wiring fetch/create/update/delete flows, adding a feature store, connecting components to Redux, or implementing async data for a domain module.
---

# Front-end API, Actions & Redux Store

Rule reference: [redux-store-and-epics.mdc](../../rules/redux-store-and-epics.mdc). Structure: [front-end-structure.mdc](../../rules/front-end-structure.mdc).

**Async model:** `configureStore` has `thunk: false`. Use **services + epics + slice actions** — do not add `createAsyncThunk` unless the team changes middleware.

## Data flow

```
Component/hook  →  dispatch(*Request)  →  epic  →  service.fetch  →  dispatch(*Success|*Failure)
                                              ↓
                                         slice updates state
                                              ↓
Component/hook  ←  useAppSelector(state => state.<domain>)
```

## 1. Service (`features/<domain>/services/`)

HTTP only — no Redux imports.

- Class or module with methods: `getAll`, `getById`, `create`, `update`, `delete`
- Base URL: `config.apiBaseUrl` from `@/config/environment`
- Auth: `Authorization: Bearer ${localStorage.getItem('authToken')}` in headers
- Parse backend envelope: `{ success, data, pagination?, message? }` — throw `new Error(message)` on `!response.ok`
- Export types (`Tag`, `CreateTagData`, etc.) from `services/index.ts`

Reference: `front-end/src/features/tags/services/tags.ts`

```typescript
const data = await response.json();
if (!response.ok) {
  throw new Error(data.message || `HTTP error! status: ${response.status}`);
}
return data.data; // or { items, pagination } for lists
```

## 2. Slice (`features/<domain>/store/<domain>Slice.ts`)

RTK `createSlice` — **pure synchronous reducers only**.

Per async operation, use a **request / success / failure** triad:

| Action | Slice effect |
|--------|----------------|
| `*Request` | `loading = true`, `error = null` |
| `*Success` | `loading = false`, merge payload into state |
| `*Failure` | `loading = false`, `error = payload` |

Also export helpers: `clear*Error`, `reset*`, `clearCurrent*` when needed.

State shape typically includes: `items[]`, `currentItem`, `loading`, `error`, `pagination`, `lastFetch`.

Reference: `front-end/src/features/tags/store/tagsSlice.ts`

## 3. Epics (`features/<domain>/store/<domain>Epics.ts`)

`redux-observable` + RxJS:

```typescript
export const fetchItemsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchItemsRequest.type),
    switchMap((action) =>
      from(domainService.getItems(action.payload)).pipe(
        map((response) => fetchItemsSuccess(response)),
        catchError((error) => {
          const msg = error.message || 'Failed to fetch items';
          toast.error(msg);
          return of(fetchItemsFailure(msg));
        })
      )
    )
  );
```

- **`ofType`** on slice request actions
- **`switchMap`** for fetch (cancel prior); **`exhaustMap`** for create/update when duplicate submits must be ignored
- **`catchError`** must return `of(failureAction)` — never let the stream die silently
- Call **service methods** from epics; keep parsing in the service
- **`toast.success` / `toast.error`** in epics for user-visible outcomes (match domain convention)
- Export individual epics or `export const domainEpics = [...]`

Reference: `front-end/src/features/tags/store/tagsEpics.ts`

## 4. Store barrel (`features/<domain>/store/index.ts`)

```typescript
export { default as tagsReducer } from "./tagsSlice";
export * from "./tagsSlice";
export * from "./tagsEpics";
```

## 5. Global registration

**Reducer** — `front-end/src/app/store/index.ts`:

```typescript
import { tagsReducer } from "@/features/tags/store";
// reducer map: tags: tagsReducer,
```

**Epics** — `front-end/src/app/store/epics/rootEpic.ts`:

```typescript
import { fetchTagsEpic, ... } from "@/features/tags/store";
// combineEpics(..., fetchTagsEpic, ...)
```

`rootEpic.ts` is the **only** place that combines epics. Do not add a second `configureStore`.

## 6. Components & hooks

- Import hooks: `useAppDispatch`, `useAppSelector` from `@/store/hooks`
- Import actions from `@/features/<domain>/store` (same feature) or `@/shared/store/<domain>` (cross-feature)
- Dispatch **request** actions only — never call services directly from components
- Read `loading`, `error`, data from `useAppSelector((state) => state.<domain>)`
- Clear errors on dialog open: `dispatch(clearDomainError())`

Reference: `front-end/src/features/tags/pages/TagFormDialog.tsx`

## 7. Cross-feature boundaries

- Feature A **must not** import `@/features/B/store` directly
- Expose stable actions through `@/shared/store/<topic>.ts` thin barrels

Reference: `front-end/src/shared/store/tags.ts`

## 8. Adding a new async flow to an existing domain

1. Add service method in `services/`
2. Add `*Request`, `*Success`, `*Failure` to slice
3. Add epic wired with `ofType`
4. Export epic from store barrel
5. Register epic in `rootEpic.ts` (reducer already exists)
6. Dispatch from hook/component

## Verification

```bash
cd front-end
npm run type-check
npm run lint
```

Manual: trigger the flow in UI — confirm loading state, success updates list/detail, failure shows toast and sets `error`.

## Progress checklist

```
- [ ] Service method(s) with typed request/response
- [ ] Slice request/success/failure actions
- [ ] Epic(s) with catchError → failure action
- [ ] store/index.ts exports
- [ ] Reducer in app/store/index.ts (if new domain)
- [ ] Epic(s) in rootEpic.ts
- [ ] Component/hook dispatches request, selects state
- [ ] Cross-feature actions via @/shared/store if needed
- [ ] type-check + lint pass
```

## Reference implementations

| Layer | File |
|-------|------|
| Service | `features/tags/services/tags.ts` |
| Slice | `features/tags/store/tagsSlice.ts` |
| Epics | `features/tags/store/tagsEpics.ts` |
| Barrel | `features/tags/store/index.ts` |
| Global store | `app/store/index.ts` |
| Root epic | `app/store/epics/rootEpic.ts` |
| Component | `features/tags/pages/TagFormDialog.tsx` |
| Shared barrel | `shared/store/tags.ts` |
| Multi-epic domain | `features/customForms/store/customFormsEpics.ts` |
