import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringAuthIntegrationOrchestrator } from '../../../monitoring';

test('MonitoringAuthIntegrationOrchestrator autorise un utilisateur synchronisé', async () => {
  const orchestrator = new MonitoringAuthIntegrationOrchestrator();
  await orchestrator.synchroniserEvenement({
    utilisateurId: 'user-auth-monitoring',
    permissions: ['monitoring.read'],
    scopes: ['SYSTEM'],
    survenanceLe: new Date(),
  });

  assert.equal(
    await orchestrator.autoriser({
      utilisateurId: 'user-auth-monitoring',
      permission: 'monitoring.read',
      scope: 'SYSTEM',
    }),
    true,
  );
});
