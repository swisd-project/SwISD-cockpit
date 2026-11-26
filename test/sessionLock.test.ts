/**
 * 1. Relative path: test/sessionLock.test.ts
 * 2. Description: Unit tests for the UI-only Argon2id session lock (lib/server/sessionLock.ts).
 * 3. Expects: node:test runner; a temp state directory; swisd-core argon2 primitives.
 * 4. Provides: Coverage for lock lifecycle — initialize, setPassword, verify, lock/unlock, persistence.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SessionLock } from '#lib/server/sessionLock.js';

async function makeStateDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'swisd-lock-'));
}

describe('SessionLock', () => {
  it('starts unlocked with no password on a fresh state dir', async () => {
    const dir = await makeStateDir();
    try {
      const lock = new SessionLock(dir);
      await lock.initialize();
      assert.equal(lock.hasPassword(), false);
      assert.equal(lock.isLocked(), false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('persists a password and unlocks on a correct verify', async () => {
    const dir = await makeStateDir();
    try {
      const lock = new SessionLock(dir);
      await lock.initialize();
      await lock.setPassword('recovery-horse-battery');
      assert.equal(lock.hasPassword(), true);
      assert.equal(lock.isLocked(), false); // setPassword leaves it unlocked

      assert.equal(await lock.verify('wrong-phrase'), false);
      // A failed verify does NOT re-lock — locking is lock()'s job, not a failed attempt's.
      assert.equal(lock.isLocked(), false);
      assert.equal(await lock.verify('recovery-horse-battery'), true);
      assert.equal(lock.isLocked(), false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('re-initializes as locked when a password exists on disk', async () => {
    const dir = await makeStateDir();
    try {
      const first = new SessionLock(dir);
      await first.initialize();
      await first.setPassword('recovery-horse-battery');

      const second = new SessionLock(dir);
      await second.initialize();
      assert.equal(second.hasPassword(), true);
      assert.equal(second.isLocked(), true); // locked by default after restart
      assert.equal(await second.verify('recovery-horse-battery'), true);
      assert.equal(second.isLocked(), false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('lock() re-engages the lock and forceUnlock() bypasses it', async () => {
    const dir = await makeStateDir();
    try {
      const lock = new SessionLock(dir);
      await lock.initialize();
      await lock.setPassword('recovery-horse-battery');
      assert.equal(await lock.verify('recovery-horse-battery'), true);
      assert.equal(lock.isLocked(), false);

      lock.lock();
      assert.equal(lock.isLocked(), true);
      lock.forceUnlock();
      assert.equal(lock.isLocked(), false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('verify always passes when no password exists', async () => {
    const dir = await makeStateDir();
    try {
      const lock = new SessionLock(dir);
      await lock.initialize();
      assert.equal(await lock.verify('anything'), true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
