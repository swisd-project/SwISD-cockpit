import { Keystone, BondAnchor } from 'swisd-network/ownership/index.js';
const stateDir = '/tmp/opencode/swisd-delivery/state';
const keystone = new Keystone({ stateDir });
await keystone.initialize();
try {
  const blob = keystone.emitBackupBlob();
  console.log('blob len', blob.length);
  const anchor = new BondAnchor({ stateDir });
  await anchor.initialize();
  const ledger = await anchor.bond(new TextDecoder().decode(blob), true);
  console.log('BOND OK', ledger.swarmName, ledger.revision);
} catch (e) {
  const err = e as Error & { details?: unknown };
  console.log('BOND FAIL', err.name, err.message, JSON.stringify(err.details));
}
