<!--
- Path: 14_swisd-cockpit/mcp/BACKLOG.md
- Description: Work ledger for swisd-cockpit — phases, tasks, state.
- Input: Owner tasks and completed work.
- Output: Open and done items with state markers.
- Provides: Task state. Never holds locked decisions (GOSPEL.md owns those).
-->

# SwISD-Cockpit backlog

State markers (standard §3): `[ ]` open · `[~]` under development · `[x]` done and tested.

- [x] Onboarding wizard UI (from 03_Swisd cockpit routes). Done (commit 03a3b29): owner chose Road A (bench); route `/wizard` renders swisd-core `provision/wizardPage` template in device frame with simulated portal backend (join → 202, status poll from bench controls). Files: `src/routes/wizard/` + `src/lib/server/wizardBench.ts`. Provision engine: `../12_swisd-core` (`src/provision/`).
- [ ] Live passthrough wizard surfaces (real portal join/status, not bench) — deferred by owner's Road A choice.

- [ ] Password-login option (keystone + recovery-phrase fallback covers MVP).
- [ ] Trust-gossip between cockpit and nodes.
- [ ] First push to GitHub still pending (remote configured: git@github.com:swisd-project/SwISD-cockpit.git).
- [ ] No test suite yet (no test script; bondtest.ts is scratch).

## Swarm task I/O (experiment bench)
- [ ] In-process executor stub + dev bench route to run a task through the envelope without hardware
- [ ] Task status display in Engine Room (frames → progress/done/failed states)
