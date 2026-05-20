import test from 'node:test';
import assert from 'node:assert/strict';
import { OfflineAuthInfrastructureService } from 'shared/auth/infrastructure/services/OfflineAuthInfrastructureService';

test('auth offline, reconnexion, synchronisation, cache offline et restauration session', async () => {
  const service = new OfflineAuthInfrastructureService();
  await service.stockerAuthLocale({ utilisateurId: 'u1', deviceId: 'd1', payload: { sessionId: 's1', offline: true } });
  const local = await service.restaurerAuthLocale('u1', 'd1');
  assert.deepEqual(local, { sessionId: 's1', offline: true });
  await service.synchroniserAuthOffline('u1', 'd1');
});
