<!--
- Path: 14_swisd-cockpit/mcp/FILETREE.md
- Description: Target tree of swisd-cockpit — the single owner of all paths and module boundaries.
- Input: The actual repository shape.
- Output: The tree as it should look.
- Provides: Paths, module boundaries, naming. Concepts and decisions live in GUIDE/GOSPEL.
-->

# SwISD-Cockpit file tree

```
14_swisd-cockpit/
├── src/
│   ├── app.html / app.d.ts
│   ├── hooks.server.ts
│   ├── routes/
│   │   ├── +layout.svelte / +page.svelte / layout.css
│   │   ├── models/+page.svelte / settings/+page.svelte / wizard/+page.svelte
│   │   └── api/                       # SvelteKit server endpoints
│   │       ├── discovery/+server.ts / topology/+server.ts / peers/ (+ [peerId]/ping)
│   │       ├── session/ (+status)     # keystone-bound login, recovery-phrase fallback
│   │       ├── ownership/ (found, enroll, status)
│   │       ├── models/ (ingest, approve, request, library, status, rename, [modelId], [modelId]/repair)
│   │       ├── credentials/huggingface
│   │       └── system/ (hostname, requirements, update)
│   └── lib/
│       ├── server/                    # sessionLock, discovery (mDNS, swarm-ID filtered), topology, conductorIdentity, devSource, wizardBench
│       ├── adapters/                  # trust (TrustRegistry + persistent trust ledger), keystone, load
│       ├── components/                # FoundingModal, UpdateApprovalModal, ModelApprovalModal/UploadModal/DropZone,
│       │   │                          # DiscoveryPanel, PendingTrustPanel, KeystoneLossBanner, SessionLockOverlay,
│       │   │                          # EngineRoomView, StageView, SwarmSidebar, ModelLibrary, NodeDetailModal
│       │   ├── ui/                    # Button, Modal, Card, Tabs, ... (18 primitives)
│       │   └── datavis/topology/      # TopologyCanvas, SwarmNode, GhostNode, TrustRing, layout
│       ├── themes/                    # midnight, cyberdeck, ultraviolet, daylight + index.css
│       ├── theme.ts / theme.svelte.ts / peerOverrides.svelte.ts / index.ts
│       └── assets/                    # favicon + device icons (8)
├── static/robots.txt
├── bondtest.ts                        # scratch test script
├── vite.config.ts / eslint.config.js / prettier.config.js / .prettierignore
├── tsconfig.json / .npmrc / .vscode/
├── package.json                       # SvelteKit 3 + Svelte 5, deps: swisd-core + swisd-network (file:../)
├── README.md
└── mcp/                               # this folder (docs, uncommitted)
```
