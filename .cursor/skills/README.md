# Project Skills



Project skills live in `.cursor/skills/<name>/SKILL.md`. They load when a task matches the skill description — use them for **multi-step workflows** instead of long always-on rules.



## Orchestrators (domain delegation)



Parent agents use these to **route** work and launch **Task subagents** with domain-specific prompts. Invoke explicitly (`disable-model-invocation: true`).



| Skill | Invoke when |

|-------|-------------|

| [domain-task-router](domain-task-router/SKILL.md) | Mixed or unclear domain; parent should pick the right delegate |

| [feature-module-delivery](feature-module-delivery/SKILL.md) | New/extended CRUD module — list page, detail page, cards, search, dialogs |

| [website-editor](website-editor/SKILL.md) | Website builder, WebpageEditor, content addons, themes, headers/footers, media, publishing |

| [form-editor-delivery](form-editor-delivery/SKILL.md) | FormBuilder, custom forms list, fill/submissions, multi-file form work |



**Child skills** (composed by orchestrators; use directly for small scoped tasks):



| Orchestrator | Child skills |

|--------------|--------------|

| feature-module-delivery | [feature-delivery](feature-delivery/SKILL.md), [frontend-redux-api](frontend-redux-api/SKILL.md), [card-list-item-ui](card-list-item-ui/SKILL.md), [component-showcase](component-showcase/SKILL.md) |

| website-editor | [media-upload-delete](media-upload-delete/SKILL.md), [card-list-item-ui](card-list-item-ui/SKILL.md), [frontend-redux-api](frontend-redux-api/SKILL.md), [component-showcase](component-showcase/SKILL.md) |

| form-editor-delivery | [form-editor-field](form-editor-field/SKILL.md), [frontend-redux-api](frontend-redux-api/SKILL.md) |



## Granular skills



| Skill | Invoke when |

|-------|-------------|

| [feature-delivery](feature-delivery/SKILL.md) | Building a new feature from a spec in `docs/specs/` |

| [frontend-redux-api](frontend-redux-api/SKILL.md) | Adding API services, Redux actions, epics, or store wiring |

| [version-release](version-release/SKILL.md) | User asks to update version or prepare a release |

| [card-list-item-ui](card-list-item-ui/SKILL.md) | Building card/list row layout — media, kebab, fields, price, tags |

| [component-showcase](component-showcase/SKILL.md) | Registering reusable card/list components in `/system/showcase` |

| [form-editor-field](form-editor-field/SKILL.md) | Adding a new FormBuilder field type |

| [media-upload-delete](media-upload-delete/SKILL.md) | Image upload, gallery, media library, file delete |

| [website-editor](website-editor/SKILL.md) | WebpageEditor addons, webpages, themes, headers/footers, publishing |



Rules index: [`.cursor/rules/README.md`](../rules/README.md)


