<!--
1. Relative path: cockpit/src/lib/components/SwarmSidebar.svelte
2. Description: Right-hand cockpit rail with a scrollable informational event log.
3. Expects: Swarm topology peers, observability events, and a peer-selection callback owned by the route.
4. Provides: Persistent sidebar composition with a polite live log region.
5. SPDX-License-Identifier: MPL-2.0
6. Copyright (c) 2026 Homahuki GmbH
-->
<script lang="ts">
  import type { ObservabilityEvent } from 'swisd-core/observability/index.js';
  import type { TopologyPeerDTO } from '#lib/server/index.js';
  import { Badge, EmptyState, StatusPill } from '#lib/components/ui/index.js';
  import { trustToStatus } from '#lib/adapters/index.js';

  interface Props {
    peers: ReadonlyArray<TopologyPeerDTO>;
    events: ReadonlyArray<ObservabilityEvent>;
    onSelectPeer: (peerId: string) => void;
  }

  let { peers, events, onSelectPeer }: Props = $props();

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { hour12: false });
  }
</script>

<aside class="sidebar" aria-label="Swarm sidebar">
  <section class="sidebar__section sidebar__section--log">
    <header class="sidebar__header">
      <h2 class="sidebar__title">Log</h2>
      <Badge count={events.length} />
    </header>

    {#if events.length === 0}
      <EmptyState title="No events yet" icon="swarm" />
    {:else}
      <ul class="log" role="log" aria-label="Swarm event log">
        {#each events as event (event.sequence)}
          <li
            class="log__row"
            class:log__row--warn={event.level === 'warn'}
            class:log__row--error={event.level === 'error'}
          >
            <span class="log__time">{formatTime(event.timestamp)}</span>
            <span class="log__topic">[{event.topic}]</span>
            <span class="log__msg">{event.message}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</aside>

<style>
  @layer components {
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: 100%;
    }
    .sidebar__section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .sidebar__section--log {
      flex: 1;
      min-height: 0;
    }
    .sidebar__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .sidebar__title {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted, var(--text));
    }
    .log {
      list-style: none;
      margin: 0;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      max-height: 20rem;
      overflow-y: auto;
      background: var(--surface);
      border-radius: var(--r-sm);
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }
    .log__row {
      display: flex;
      gap: 0.5rem;
      color: var(--text);
    }
    .log__row--warn {
      color: var(--warn);
    }
    .log__row--error {
      color: var(--danger, var(--warn));
    }
    .log__time {
      color: var(--text-muted, var(--text));
      flex-shrink: 0;
    }
    .log__topic {
      color: var(--accent);
      flex-shrink: 0;
    }
    .log__msg {
      overflow-wrap: anywhere;
    }
  }
</style>
