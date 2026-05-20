import test from 'node:test';
import assert from 'node:assert/strict';
import { OfflineAuthInfrastructureService } from 'shared/auth/infrastructure/services/OfflineAuthInfrastructureService';

test('synchronisation offline, reprise connexion, fusion etat session', async () => {
  const service = new OfflineAuthInfrastructureService();
  await service.stockerAuthLocale({ utilisateurId: 'u1', deviceId: 'd1', payload: { session: 'ok' } });
  assert.deepEqual(await service.restaurerAuthLocale('u1', 'd1'), { session: 'ok' });
  await service.synchroniserAuthOffline('u1', 'd1');
});
