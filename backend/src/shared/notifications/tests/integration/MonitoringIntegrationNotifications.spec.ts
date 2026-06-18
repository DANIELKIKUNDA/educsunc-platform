import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsMonitoringIntegrationOrchestrator } from 'shared/notifications';

test('le pont monitoring consolide observations snapshots et cycles workers', () => {
  const orchestrateur = new NotificationsMonitoringIntegrationOrchestrator();

  orchestrateur.enregistrerObservation({
    source: 'GENERAL',
    message: 'Observation de test',
    notificationContext: {
      notificationId: 'notification-monitoring',
      canal: 'IN_APP',
      organisationId: 'org-1',
      ecoleId: 'ecole-1',
      correlationId: 'corr-1',
      requestId: 'req-1',
      acteurId: 'acteur-1',
      requestedAt: new Date().toISOString(),
    },
  });
  orchestrateur.synchroniserFiles({
    totalDispatch: 2,
    totalRetry: 1,
    totalReplay: 0,
    totalEscalade: 0,
    totalDeadLetter: 0,
    saturationDetectee: false,
  });
  orchestrateur.synchroniserWorkers({
    typeWorker: 'DIFFUSION',
    succes: true,
    totalTraites: 2,
    totalSucces: 2,
    totalEchecs: 0,
    executeLe: new Date(),
    details: [],
    metadata: {},
  });

  const snapshot = orchestrateur.obtenirSnapshot();

  assert.equal(snapshot.observations.length, 1);
  assert.equal(snapshot.queues.observationTechnique?.totalDispatch, 2);
  assert.equal(snapshot.workers.totalCycles, 1);
});
