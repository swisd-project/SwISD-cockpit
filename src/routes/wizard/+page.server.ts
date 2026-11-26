// 1. Relative path: src/routes/wizard/+page.server.ts
// 2. Description: Serves the wizard bench document (real template + simulated portal backend).
// 3. Expects: The wizard bench renderer.
// 4. Provides: The bench HTML for the iframe on /wizard.
// 5. SPDX-License-Identifier: MPL-2.0
// 6. Copyright (c) 2026 Homahuki GmbH

import { renderBenchHtml } from '#lib/server/wizardBench.js';

export const load = async () => ({ html: renderBenchHtml() });
