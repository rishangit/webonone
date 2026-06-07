---
name: domain-task-router
description: Routes multi-domain or ambiguous tasks to the correct domain orchestrator and launches Task subagents. Use when a request spans multiple areas, the domain is unclear, or the user asks to delegate module, website, or form-editor work.
disable-model-invocation: true
---

# Domain Task Router

Parent-agent playbook for classifying work and delegating to domain orchestrators via the **Task** tool.

## When to use this skill

- Request touches more than one domain (e.g. new module + website page)
- User says "delegate", "sub-agent", or domain is ambiguous
- Large task that should not run in a single context window

**Skip routing** for small, single-file edits — read the granular child skill directly (e.g. `form-editor-field`, `card-list-item-ui`).

## Routing table

| Signals | Orchestrator |
|---------|--------------|
| New feature module, list page, detail page, cards, list view, search, filters, pagination, add/edit/delete dialogs, CRUD domain | [feature-module-delivery](../feature-module-delivery/SKILL.md) |
| `/system/web/*`, WebpageEditor, themes, headers, footers, media library, addons, public site, `companyWeb*` APIs | [website-editor](../website-editor/SKILL.md) |
| FormBuilder, custom forms, field types, fill/submit, appointment forms, submissions | [form-editor-delivery](../form-editor-delivery/SKILL.md) |

**Not website:** company profile "Website URL" field (`features/companies/`) or uploads outside `companies/{id}/web/media/` — route to `feature-module-delivery` or `media-upload-delete` instead.

## Parent workflow

1. **Classify** — map each part of the request to zero or one orchestrator (can be multiple).
2. **Read** — open each matching orchestrator `SKILL.md` before launching subagents.
3. **Delegate** — launch Task subagent(s) using the prompt template from that orchestrator.
4. **Merge** — combine subagent handoffs; resolve conflicts; parent runs verification once.

## Delegation sizing

| Task size | Action |
|-----------|--------|
| Single small change (one card tweak, one field type) | Parent handles inline; read child skill only |
| Multi-file feature (list + detail + Redux + dialogs) | Launch **one** `generalPurpose` subagent per domain |
| Research / find patterns first | Launch `explore` subagent, then `generalPurpose` |
| Independent domains in one request | Launch **parallel** subagents (one per domain) |

## Subagent launch (parent)

Use the **Task** tool. Fill in `<orchestrator prompt template>` from the target orchestrator skill.

```
subagent_type: generalPurpose   # or explore for research-only pass
description: <short domain label, e.g. "Spaces module delivery">

prompt:
You are delivering work in the <domain> area of this monorepo.

READ FIRST (in order):
1. .cursor/skills/<orchestrator>/SKILL.md
2. Child skills listed in that orchestrator
3. Rules referenced by those skills

TASK:
<user request, scoped to this domain only>

DELIVERABLES:
<checklist from orchestrator>

RETURN TO PARENT (required):
- Files created/changed (paths)
- Checklist status (done / skipped / blocked)
- Manual test steps performed or recommended
- Blockers or follow-ups for other domains
```

## Verification (parent, after merge)

```bash
cd front-end && npm run type-check && npm run lint
cd back-end && node scripts/verifyDatabase.js   # if any subagent changed schema
```

Manual smoke per subagent handoff. Do not mark complete until all domain checklists pass or blockers are documented.
