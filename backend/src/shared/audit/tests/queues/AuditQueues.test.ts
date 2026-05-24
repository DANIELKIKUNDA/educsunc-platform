import assert from 'node:assert/strict';
import test from 'node:test';
import { PersistentOfflineAuditQueue } from 'shared/audit/infrastructure/offline';
import { AuditQueueMonitoringService } from 'shared/audit/infrastructure/monitoring';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('les queues offline Audit exposent backlog et throughput sans perdre le tenant', () => {
  reinitialiserEtatAuditTests();
  const queue = new PersistentOfflineAuditQueue();

  queue.enfiler({
    envelope: {
      name: 'OfflineAuditCaptured',
      payload: {},
      metadata: {
        eventId: 'evt-offline-1',
        organisationId: 'org-a',
        ecoleId: 'ecole-a',
        scope: 'ECOLE',
        replay: false,
        retryCount: 0,
        occurredAt: '2026-05-24T10:00:00.000Z',
      },
    },
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
    dateActionReelle: new Date('2026-05-24T10:00:00.000Z'),
  });

  const snapshot = new AuditQueueMonitoringService().obtenirSnapshot();
  assert.equal(snapshot.tailleQueueOffline, 1);
  assert.equal(snapshot.backlogOffline, 1);
});
