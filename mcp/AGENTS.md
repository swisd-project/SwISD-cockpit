<!--
- Path: 14_swisd-cockpit/mcp/AGENTS.md
- Description: Binder and entry point for the swisd-cockpit domain — document map, workflow, conflict and update policy per project-standard.md.
- Input: The four supporting documents in this folder, project-standard.md (workspace root), the codebase.
- Output: Orientation for any agent working in this domain.
- Provides: The map and rules of engagement. Definitions, paths, decisions, and tasks live in the supporting documents.
-->

# AGENTS.md — SwISD-Cockpit domain binder

## 1. Purpose and scope

Governs `14_swisd-cockpit`: the SwISD operator UI (SvelteKit + Svelte 5, server endpoints, trust/keystone/load adapters, swarm topology view, theming). Does not govern `12_swisd-core` or `13_swisd-network`; SwISD-wide shared laws are owned by core's gospel — this domain points, never copies.

## 2. Project goal

SwISD-Cockpit is the human console over a SwISD swarm: keystone-bound login with recovery-phrase fallback, swarm discovery/topology (swarm-ID filtered), ownership enrollment, model ingest/approval/library, system updates. What it is not: a base library and not the P2P layer — it depends on network and core (core gospel D-003).

## 3. Document map

| File | Domain | Read when |
| --- | --- | --- |
| `GOSPEL.md` | Domain decisions + pointers to the shared SwISD laws in 12_swisd-core/mcp/GOSPEL.md | Always first. |
| `GUIDE.md` | Architecture: stack, layout, conventions | Before adding or changing modules. |
| `FILETREE.md` | Target tree: paths, module boundaries, naming | Before creating/moving files; diff after large changes. |
| `BACKLOG.md` | Work: phases, tasks, state | Before starting any task; record state while working. |
| `README.md` | Human-facing repo readme | On demand only. |
| `../12_swisd-core/mcp/GOSPEL.md` | SwISD-wide law (keys, ledger integrity, dependency direction, test harness, README style) | Whenever a shared law matters. |

## 4. AI workflow

1. Analyze the prompt; identify the affected documents.
2. Binder first; read GOSPEL (and the core gospel it points to), then only the relevant documents.
3. Generate; flag conflicts; point instead of copy.

## 5. Do's and Don'ts

- Do: depend on network and core, never the reverse (core gospel D-003). Don't: restate shared laws here.
- Do: when tests land, node:test + tsx only (core gospel D-004). Don't: add test dependencies.
- Do: state changes only after owner confirmation (standard §5.3). Don't: hardcode paths outside FILETREE.

## 6. Conflict resolution

Each document is the expert authority of its domain. If this domain's docs conflict with the shared law in core's gospel, the core gospel wins (canonical home). Remaining conflicts are flagged to the owner; no autonomous resolution.

## 7. Document update policy

After a major change, the agent proposes an update to the relevant document; the owner approves. Minor edits happen on explicit task.

## 8. Glossary pointers

| Term | Canonical location |
| --- | --- |
| Ledger key format, ledger integrity | 12_swisd-core GOSPEL D-001/D-002 |
| Dependency direction | 12_swisd-core GOSPEL D-003 |
| Test harness, README style | 12_swisd-core GOSPEL D-004/D-005 |
| Login / session model | GOSPEL (login law); endpoints in FILETREE |
| Layout conventions | GUIDE; paths in FILETREE |

## 9. Pending reminders

- Password login (keystone + recovery-phrase fallback covers MVP) — BACKLOG.
- Trust-gossip cockpit ↔ nodes — BACKLOG.
- First GitHub push still pending — BACKLOG/GUIDE.
- No test suite yet (bondtest.ts is scratch) — BACKLOG.
