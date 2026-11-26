<!--
1. Relative path: src/routes/wizard/+page.svelte
2. Description: Wizard bench — the real provisioning wizard in a device frame, backend simulated.
3. Expects: The bench HTML from +page.server.ts; swisd-core/provision state machine inside the frame.
4. Provides: Offline verification of the onboarding wizard UX: transition log, resolve controls (joined or typed failure), reset.
5. SPDX-License-Identifier: MPL-2.0
6. Copyright (c) 2026 Homahuki GmbH
-->

<script lang="ts">
  import { Button, Card, PageShell } from '#lib/components/ui/index.js';

  let { data } = $props();

  type Outcome = 'joined' | 'auth-failed' | 'join-timeout' | 'ssid-not-found' | 'invalid-request';

  const OUTCOMES: { value: Outcome; label: string; tone: 'ok' | 'bad' }[] = [
    { value: 'joined', label: 'Joined', tone: 'ok' },
    { value: 'auth-failed', label: 'Auth failed', tone: 'bad' },
    { value: 'join-timeout', label: 'Join timeout', tone: 'bad' },
    { value: 'ssid-not-found', label: 'SSID not found', tone: 'bad' },
    { value: 'invalid-request', label: 'Invalid request', tone: 'bad' }
  ];

  let benchRun = $state(0);
  let log: { t: string; kind: 'info' | 'ok' | 'bad' }[] = $state([]);
  let frame: HTMLIFrameElement | undefined = $state();

  function stamp(): string {
    return new Date().toLocaleTimeString();
  }

  function push(t: string, kind: 'info' | 'ok' | 'bad' = 'info'): void {
    log = [...log, { t: `${stamp()} — ${t}`, kind }];
  }

  function onMessage(event: MessageEvent): void {
    const msg = event.data;
    if (!msg || msg.source !== 'wizard-bench') return;
    if (msg.type === 'join') {
      const body = JSON.parse(String(msg.data));
      push(`POST /join — ssid "${body.ssid}", ${body.security}, temporary=${body.temporary}`);
    } else if (msg.type === 'poll') {
      push('GET /status — awaiting verdict');
    }
  }

  function resolve(outcome: Outcome): void {
    frame?.contentWindow?.postMessage({ source: 'bench-host', type: 'result', outcome }, '*');
    push(`verdict: ${outcome}`, outcome === 'joined' ? 'ok' : 'bad');
  }

  function reset(): void {
    benchRun += 1;
    log = [];
    push('bench reset — portal back to idle');
  }
</script>

<svelte:window onmessage={onMessage} />

<PageShell>
  <header class="mb-8 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h1 class="text-3xl font-bold" style="color: var(--accent);">Wizard Bench</h1>
    </div>
    <Button variant="primary" onclick={reset}>Reset</Button>
  </header>

  <p class="mb-6 text-sm" style="color: var(--muted);">
    The frame renders the real provisioning template from
    <code>swisd-core/provision/wizardPage</code> — idle only; every transition below runs through
    the template's own state machine. Resolve the simulated <code>/status</code> poll to move it.
  </p>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1">
      <Card title="Device frame">
        <div class="mx-auto" style="max-width: 320px;">
          {#key benchRun}
          <iframe
            title="Provisioning wizard (simulated)"
            srcdoc={data.html}
            bind:this={frame}
            class="w-full rounded-xl border-2"
            style="height: 640px; border-color: var(--border); background: var(--bg);"
            sandbox="allow-scripts allow-forms"
          ></iframe>
          {/key}
        </div>
      </Card>
    </div>

    <Card title="Resolve status poll">
      <p class="mb-4 text-sm" style="color: var(--muted);">
        The next <code>/status</code> poll in the frame is answered with your verdict.
      </p>
      <div class="flex flex-wrap gap-2">
        {#each OUTCOMES as o (o.value)}
          <Button
            variant={o.tone === 'ok' ? 'primary' : 'secondary'}
            onclick={() => resolve(o.value)}
          >
            {o.label}
          </Button>
        {/each}
      </div>
    </Card>

    <Card title="Transition log">
      <ul class="space-y-1 font-mono text-xs" style="max-height: 420px; overflow-y: auto;">
        {#each log as entry}
          <li style="color: {entry.kind === 'ok' ? 'var(--ok)' : entry.kind === 'bad' ? 'var(--danger)' : 'var(--muted)'};">
            {entry.t}
          </li>
        {:else}
          <li style="color: var(--muted);">No transitions yet — connect in the frame.</li>
        {/each}
      </ul>
    </Card>
  </div>
</PageShell>
