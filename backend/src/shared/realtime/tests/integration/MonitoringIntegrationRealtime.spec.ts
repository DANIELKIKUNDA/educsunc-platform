import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeMonitoringIntegrationOrchestrator } from 'shared/realtime';

test('Monitoring realtime produit une commande plateforme bornee par monitoring.read', async () => {
  const diffusees: unknown[] = [];
  const orchestrateur = new RealtimeMonitoringIntegrationOrchestrator(async (commande) => { diffusees.push(commande); });
  const publie = await orchestrateur.publier({
    evenementId: 'alert-1', type: 'monitoring.alert.created', correlationId: 'corr-1', critique: true,
    payload: { alertId: 'alert-1', composant: 'postgresql' },
  });
  assert.equal(publie, true);
  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.totalSignaux, 1);
  assert.equal(snapshot.dernierType, 'monitoring:monitoring.alert.created');
  assert.equal(snapshot.messages[0]?.canal, 'monitoring');
  assert.deepEqual(snapshot.messages[0]?.permissionsRequises, ['monitoring.read']);
  assert.equal(snapshot.messages[0]?.organisationId, undefined);
  assert.equal(diffusees.length, 1);
});

test('Monitoring realtime deduplique une tempete de meme correlation', async () => {
  const orchestrateur = new RealtimeMonitoringIntegrationOrchestrator(undefined, 60_000);
  const signal = { evenementId: 'health-1', type: 'monitoring.component.degraded' as const, correlationId: 'db-down', payload: { composant: 'postgresql' } };
  assert.equal(await orchestrateur.publier(signal), true);
  assert.equal(await orchestrateur.publier({ ...signal, evenementId: 'health-2' }), false);
  assert.equal(orchestrateur.snapshot().totalSignaux, 1);
});
