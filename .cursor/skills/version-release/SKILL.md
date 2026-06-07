---
name: version-release
description: Bumps semver across package.json files, organizes backend migration scripts by version, and verifies initDatabase wiring. Use when the user asks to update version, prepare a release, or bump patch/minor/major.
---

# Version Release

Follow [version-update-workflow.mdc](../../rules/version-update-workflow.mdc) and [backend-database-scripts.mdc](../../rules/backend-database-scripts.mdc).

## Checklist

### 1. Branch scope

```bash
git branch --show-current
git log master..HEAD --oneline
git diff master --stat
```

Classify: **patch** (bugfix), **minor** (feature), **major** (breaking). Ask user if unclear.

### 2. Bump version consistently

Update the same semver in:

- `package.json` (repo root)
- `front-end/package.json`
- `back-end/package.json`

Do **not** create git tags unless explicitly requested.

### 3. Backend scripts for this release

If new DB migrations exist:

- [ ] Scripts live in `back-end/scripts/<new-version>/`
- [ ] Descriptive filenames (not shortened)
- [ ] Each exports async function accepting `pool`
- [ ] Idempotent (safe to re-run)
- [ ] Wired into `back-end/scripts/initDatabase.js`
- [ ] Version folder README if multiple scripts

### 4. Verify initDatabase

- [ ] `createTables` invokes new migration modules
- [ ] Run `node back-end/scripts/verifyDatabase.js`
- [ ] Re-run migration to confirm idempotency

### 5. Front-end / docs

- [ ] Specs under `docs/specs/<version>/` reference correct version if applicable
- [ ] npm scripts or docs paths updated if script locations changed

### 6. Final verification

```bash
cd front-end && npm run type-check && npm run lint
```

Confirm all three `package.json` files show the same version.
