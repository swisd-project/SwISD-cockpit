<!--
- Path: 14_swisd-cockpit/mcp/BACKLOG.md
- Description: Work ledger for swisd-cockpit — phases, tasks, state.
- Input: Owner tasks and completed work.
- Output: Open and done items with state markers.
- Provides: Task state. Never holds locked decisions (GOSPEL.md owns those).
-->

# SwISD-Cockpit backlog

State markers (standard §3): `[ ]` open · `[~]` under development · `[x]` done and tested.

- [ ] Onboarding wizard UI — design/join/status surfaces + wizard flow (from 03_Swisd cockpit routes). Owner verdict (2026-11): important, implementation approach undecided — open design question, nothing locked. Provision engine already lives in `../12_swisd-core` (`src/provision/`).

- [ ] Password-login option (keystone + recovery-phrase fallback covers MVP).
- [ ] Trust-gossip between cockpit and nodes.
- [ ] First push to GitHub still pending (remote configured: git@github.com:swisd-project/SwISD-cockpit.git).
- [ ] No test suite yet (no test script; bondtest.ts is scratch).

## Swarm task I/O (experiment bench)
- [ ] In-process executor stub + dev bench route to run a task through the envelope without hardware
- [ ] Task status display in Engine Room (frames → progress/done/failed states)
