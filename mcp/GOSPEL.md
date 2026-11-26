<!--
- Path: 14_swisd-cockpit/mcp/GOSPEL.md
- Description: Locked decisions and environment law for swisd-cockpit.
- Input: Owner decisions, the codebase, and the shared SwISD laws in ../12_swisd-core/mcp/GOSPEL.md.
- Output: Domain-specific law; pointers to the canonical shared laws.
- Provides: The law for this domain. Shared SwISD laws are pointed at, never copied.
-->

# SwISD-Cockpit gospel

Shared SwISD laws (key format, ledger integrity, dependency direction, test harness, README style) live canonically in `../12_swisd-core/mcp/GOSPEL.md` (D-001…D-005). Pointers only:

- Keys in ledgers, ledger integrity, `LedgerCorruptError` — core gospel D-001/D-002.
- Dependency direction: cockpit → network (→ core), never the reverse — core gospel D-003.
- Tests: node:test + tsx only (when tests land) — core gospel D-004. READMEs dry — core gospel D-005.
- Trust decisions keystone-signed, never memory-only (canonical: core gospel D-002). Domain consequence: TrustRegistry backed by a persistent trust ledger.

Domain decisions

- Login is keystone-bound; recovery-phrase fallback is the only alternative until password login lands.
- mDNS discovery filtered by swarm ID (`deriveSwarmId`). Never show peers from other swarms.

Environment

- SvelteKit + Svelte 5 (runes), adapter-node, Tailwind, Vite; Node 22+. Deps: `swisd-core` + `swisd-network` (`file:../`).
- Remote: git@github.com:swisd-project/SwISD-cockpit.git — first push pending.
