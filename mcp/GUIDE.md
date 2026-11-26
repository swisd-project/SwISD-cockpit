<!--
- Path: 14_swisd-cockpit/mcp/GUIDE.md
- Description: Architecture of swisd-cockpit — stack, concepts, module conventions.
- Input: The codebase, GOSPEL.md, and the shared laws in ../12_swisd-core/mcp/GOSPEL.md.
- Output: Concepts, module layout, build/check/lint recipes.
- Provides: The canonical architecture reference for swisd-cockpit.
-->

# SwISD-Cockpit guide

- SvelteKit 3 + Svelte 5 (runes), adapter-node, Tailwind 4, Vite 8. Node 22+.
- Install: `npm install` (pulls swisd-core + swisd-network via `file:../`). Dev: `npm run dev`. Build: `npm run build`. Check: `npm run check` (svelte-check). Lint: `npm run lint` (prettier + eslint).
- No test script yet; when tests land: harness law in 12_swisd-core GOSPEL D-004.
- Layout: `src/routes/api/` = server endpoints (one concern per folder). `src/lib/server/` = server-only logic (sessionLock, discovery, topology). `src/lib/adapters/` = trust/keystone/load bridges to swisd-network. `src/lib/components/ui/` = primitives, `datavis/topology/` = canvas swarm view. Themes in `src/lib/themes/`.
- Path aliases: `#lib`, `#lib/*`, `#lib/components/ui`, `#lib/components/datavis`.
- New feature: server endpoint in `src/routes/api/<name>/+server.ts` + logic in `src/lib/server/` + UI component in `src/lib/components/`.
- Dependency direction: cockpit → network → core (canonical: 12_swisd-core GOSPEL D-003).
- Remote: git@github.com:swisd-project/SwISD-cockpit.git — first push pending.
