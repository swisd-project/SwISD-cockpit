/**
 * 1. Relative path: test/conductorIdentity.test.ts
 * 2. Description: Unit tests for the Conductor device Ed25519 identity (lib/server/conductorIdentity.ts).
 * 3. Expects: node:test runner; a temp state directory; swisd-core crypto primitives.
 * 4. Provides: Coverage for identity creation, persistence, legacy SPKI migration, and signing.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConductorIdentity } from '#lib/server/conductorIdentity.js';
import { generateEd25519KeyPair, rawPublicKeyFromSpki, verifyEd25519 } from 'swisd-core/crypto/index.js';
import { bytesToHex, hexToBytes } from 'swisd-core/crypto/hex.js';

async function makeStateDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'swisd-identity-'));
}

describe('ConductorIdentity', () => {
  it('throws before initialize', async () => {
    const dir = await makeStateDir();
    try {
      const identity = new ConductorIdentity(dir);
      assert.throws(() => identity.getPublicKeyHex(), /not initialized/);
      assert.throws(() => identity.getKeyPair(), /not initialized/);
      assert.throws(() => identity.sign(new Uint8Array(4)), /not initialized/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('creates and persists a new identity on a fresh state dir', async () => {
    const dir = await makeStateDir();
    try {
      const identity = new ConductorIdentity(dir);
      await identity.initialize();

      const pubHex = identity.getPublicKeyHex();
      assert.match(pubHex, /^0x?[0-9a-f]{64}$/);
      // Raw 32-byte public key, not the 44-byte SPKI DER.
      assert.equal(hexToBytes(pubHex).length, 32);

      const kp = identity.getKeyPair();
      assert.equal(kp.privateKey.length, 48); // PKCS8 DER Ed25519
      assert.equal(kp.publicKey.length, 32);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('reloads the same identity from disk across restarts', async () => {
    const dir = await makeStateDir();
    try {
      const first = new ConductorIdentity(dir);
      await first.initialize();
      const firstPub = first.getPublicKeyHex();

      const second = new ConductorIdentity(dir);
      await second.initialize();
      assert.equal(second.getPublicKeyHex(), firstPub);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('signs payloads that verify against its own public key', async () => {
    const dir = await makeStateDir();
    try {
      const identity = new ConductorIdentity(dir);
      await identity.initialize();
      const payload = new TextEncoder().encode('swisd conductor payload');
      const signature = identity.sign(payload);

      const pub = hexToBytes(identity.getPublicKeyHex());
      assert.equal(verifyEd25519(pub, payload, signature), true);
      assert.equal(verifyEd25519(pub, new TextEncoder().encode('tampered'), signature), false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('migrates a legacy 44-byte SPKI public key to the raw 32-byte format', async () => {
    const dir = await makeStateDir();
    try {
      await mkdir(join(dir, 'cockpit'), { recursive: true });
      const kp = generateEd25519KeyPair();
      const legacyPub = bytesToHex(kp.publicKey); // SPKI DER, 44 bytes
      assert.equal(hexToBytes(legacyPub).length, 44);

      const identityPath = join(dir, 'cockpit', 'conductor-identity.json');
      await writeFile(
        identityPath,
        JSON.stringify({ publicKeyHex: legacyPub, privateKeyHex: bytesToHex(kp.privateKey) }),
        'utf-8',
      );

      const identity = new ConductorIdentity(dir);
      await identity.initialize();
      const pubHex = identity.getPublicKeyHex();
      assert.equal(hexToBytes(pubHex).length, 32);
      assert.deepEqual(hexToBytes(pubHex), rawPublicKeyFromSpki(kp.publicKey));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
