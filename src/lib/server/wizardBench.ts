// 1. Relative path: src/lib/server/wizardBench.ts
// 2. Description: Renders the real provisioning wizard template as a benchable HTML document with a simulated portal backend.
// 3. Expects: `swisd-core/provision/wizardPage` (the zero-dependency captive-portal template) — unchanged.
// 4. Provides: renderBenchHtml() — the actual wizard page with fetch('/join') + fetch('/status') redirected to the bench host over postMessage, so the portal state machine runs without a device.
// 5. SPDX-License-Identifier: MPL-2.0
// 6. Copyright (c) 2026 Homahuki GmbH

import { renderWizardPage } from 'swisd-core/provision/wizardPage.js';

/**
 * Injected ahead of the template's own script: /join answers 202 (mirrors the real portal's
 * accepted-then-poll contract) and /status waits for the bench host's verdict. The template's
 * own JS performs every state transition — the sim only plays the backend.
 */
const SIM_BACKEND = `<script>(function () {
  var nativeFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var path;
    try { path = new URL(url, 'http://sim').pathname; } catch (e) { path = url; }

    if (path === '/join' && init && init.method === 'POST') {
      parent.postMessage({ source: 'wizard-bench', type: 'join', data: init.body }, '*');
      return Promise.resolve(new Response(null, { status: 202 }));
    }
    if (path === '/status') {
      return new Promise(function (resolve) {
        function onMessage(event) {
          var msg = event.data;
          if (!msg || msg.source !== 'bench-host' || msg.type !== 'result') return;
          window.removeEventListener('message', onMessage);
          resolve(new Response(
            JSON.stringify(msg.outcome === 'joined'
              ? { status: 'joined' }
              : { status: 'failed', error: msg.outcome }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          ));
        }
        window.addEventListener('message', onMessage);
        parent.postMessage({ source: 'wizard-bench', type: 'poll' }, '*');
      });
    }
    return nativeFetch.apply(this, arguments);
  };
})();</scr` + `ipt>`;

export function renderBenchHtml(): string {
  return renderWizardPage('idle').replace('<head>', '<head>' + SIM_BACKEND);
}
