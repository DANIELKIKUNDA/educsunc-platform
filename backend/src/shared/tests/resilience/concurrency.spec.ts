import assert from 'node:assert/strict';
import test from 'node:test';
import { ConcurrencyService } from 'shared/infrastructure/concurrency/ConcurrencyService';

test('les conflits de concurrence sont detectes proprement', () => {
  const service = new ConcurrencyService();
  assert.doesNotThrow(() => service.verifierVersion(1, 1));
  assert.throws(() => service.verifierVersion(1, 2), /CONFLIT_CONCURRENCE/);
});
