import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AuditJobFactory,
  AuditWorkerMonitoringService,
  PersistentAuditJobQueue,
} from 'shared/audit/infrastructure/workers';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('les workers Audit exposent backlog throughput et sante par queue', () => {
  reinitialiserEtatAuditTests();
  const factory = new AuditJobFactory();
  const queue = new PersistentAuditJobQueue();

  queue.enqueue(factory.creer('MonitoringRefreshJob', 'MONITORING', { refresh: true }));
  queue.enqueue(factory.creer('AnalyticsBatchJob', 'ANALYTICS', { batch: 1 }));

  const snapshot = new AuditWorkerMonitoringService().obtenirSnapshot();
  assert.equal(snapshot.backlog, 2);
  assert.equal(snapshot.monitoring, 1);
  assert.equal(snapshot.analytics, 1);
  assert.equal(snapshot.workerHealth.MONITORING, 'IDLE');
});
