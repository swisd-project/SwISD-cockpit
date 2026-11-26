/**
 * 1. Relative path: test/topology.test.ts
 * 2. Description: Unit tests for the pure swarm topology builder (lib/server/topology.ts).
 * 3. Expects: node:test runner; no services — pure DTO construction.
 * 4. Provides: Coverage for dedupe, conductor exclusion, liveness rules, sanitization, and counts.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSwarmTopology, type TopologyPeerInput } from '#lib/server/topology.js';

const NOW = 1_000_000;

function peer(overrides: Partial<TopologyPeerInput> = {}): TopologyPeerInput {
  return {
    peerId: 'peer-1',
    hostname: 'worker-1',
    trustState: 'trusted',
    discoveredAt: NOW,
    lastSeenAt: NOW,
    source: 'mdns',
    capabilities: [],
    loadScore: null,
    activeTaskCount: null,
    deviceType: 'raspi',
    modalities: [],
    ...overrides,
  };
}

function build(peers: TopologyPeerInput[], overrides: { conductorPeerId?: string } = {}) {
  return buildSwarmTopology({ generatedAt: NOW, conductorPeerId: 'conductor', peers, ...overrides });
}

describe('buildSwarmTopology', () => {
  it('throws on an empty conductor peer ID', () => {
    assert.throws(() => build([], { conductorPeerId: '' }), TypeError);
  });

  it('throws on an empty peer ID', () => {
    assert.throws(() => build([peer({ peerId: '' })]), TypeError);
  });

  it('excludes the conductor from the peer list', () => {
    const result = build([peer({ peerId: 'conductor' }), peer({ peerId: 'peer-1' })]);
    assert.deepEqual(result.peers.map((p) => p.peerId), ['peer-1']);
  });

  it('dedupes peers by peerId, keeping the most recently discovered record', () => {
    const result = build([
      peer({ peerId: 'peer-1', hostname: 'old', discoveredAt: 100 }),
      peer({ peerId: 'peer-1', hostname: 'new', discoveredAt: 200 }),
    ]);
    assert.equal(result.peers.length, 1);
    assert.equal(result.peers[0]!.hostname, 'new');
  });

  it('sorts peers by peerId', () => {
    const result = build([peer({ peerId: 'b' }), peer({ peerId: 'a' })]);
    assert.deepEqual(result.peers.map((p) => p.peerId), ['a', 'b']);
  });

  it('treats trusted peers as online even when mDNS is quiet', () => {
    const result = build([peer({ trustState: 'trusted', lastSeenAt: null })]);
    assert.equal(result.peers[0]!.presence, 'online');
  });

  it('treats pending peers as online only with recent mDNS activity', () => {
    const recent = build([peer({ trustState: 'pending', lastSeenAt: NOW - 30_000 })]);
    assert.equal(recent.peers[0]!.presence, 'online');

    const stale = build([peer({ trustState: 'pending', lastSeenAt: NOW - 61_000 })]);
    assert.equal(stale.peers[0]!.presence, 'offline');

    const neverSeen = build([peer({ trustState: 'pending', lastSeenAt: null })]);
    assert.equal(neverSeen.peers[0]!.presence, 'offline');
  });

  it('counts swarm size, ghosts, and offline peers', () => {
    const result = build([
      peer({ peerId: 'a', trustState: 'trusted', lastSeenAt: NOW }), // online trusted
      peer({ peerId: 'b', trustState: 'trusted', lastSeenAt: null }), // online trusted (assumed)
      peer({ peerId: 'c', trustState: 'pending', lastSeenAt: NOW - 30_000 }), // online pending → ghost
      peer({ peerId: 'd', trustState: 'pending', lastSeenAt: null }), // offline pending → ghost + offline
      peer({ peerId: 'e', trustState: 'rejected', lastSeenAt: null }), // offline rejected
    ]);
    assert.equal(result.swarmSize, 2);
    assert.equal(result.ghostCount, 2);
    assert.equal(result.offlineCount, 2);
    assert.equal(result.peers.length, 5);
  });

  it('sanitizes load scores: clamps to [0,1], NaN → null, infinities → bounds', () => {
    const result = build([
      peer({ peerId: 'a', loadScore: 2.0 }),
      peer({ peerId: 'b', loadScore: -1 }),
      peer({ peerId: 'c', loadScore: Number.NaN }),
      peer({ peerId: 'd', loadScore: Number.POSITIVE_INFINITY }),
      peer({ peerId: 'e', loadScore: Number.NEGATIVE_INFINITY }),
      peer({ peerId: 'f', loadScore: 0.5 }),
    ]);
    const scores = Object.fromEntries(result.peers.map((p) => [p.peerId, p.loadScore]));
    assert.equal(scores['a'], 1);
    assert.equal(scores['b'], 0);
    assert.equal(scores['c'], null);
    assert.equal(scores['d'], 1);
    assert.equal(scores['e'], 0);
    assert.equal(scores['f'], 0.5);
  });

  it('sanitizes task counts: truncates, negative → 0, NaN → null', () => {
    const result = build([
      peer({ peerId: 'a', activeTaskCount: 3.7 }),
      peer({ peerId: 'b', activeTaskCount: -5 }),
      peer({ peerId: 'c', activeTaskCount: Number.NaN }),
    ]);
    const counts = Object.fromEntries(result.peers.map((p) => [p.peerId, p.activeTaskCount]));
    assert.equal(counts['a'], 3);
    assert.equal(counts['b'], 0);
    assert.equal(counts['c'], null);
  });

  it('copies capabilities and modalities defensively', () => {
    const caps = ['kokoro-tts'];
    const mods = ['T2T'] as const;
    const result = build([peer({ peerId: 'a', capabilities: caps, modalities: [...mods] })]);
    assert.deepEqual(result.peers[0]!.capabilities, ['kokoro-tts']);
    assert.deepEqual(result.peers[0]!.modalities, ['T2T']);
    assert.notEqual(result.peers[0]!.capabilities, caps);
  });

  it('carries the generatedAt timestamp and conductor ID through', () => {
    const result = build([peer({ peerId: 'a' })]);
    assert.equal(result.generatedAt, NOW);
    assert.equal(result.conductorPeerId, 'conductor');
  });
});
