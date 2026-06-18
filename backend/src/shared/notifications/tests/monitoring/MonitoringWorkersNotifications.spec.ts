import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationWorkerMonitoringBridge } from '../../integration/monitoring/workers/NotificationWorkerMonitoringBridge';

test('la vue monitoring workers consolide les cycles et les echecs observes', () => {
  const snapshot = new NotificationWorkerMonitoringBridge().construireSnapshot(
    [
      {
        typeWorker: 'DIFFUSION',
        succes: true,
        totalTraites: 3,
        totalSucces: 3,
        totalEchecs: 0,
        executeLe: new Date(),
        details: [],
        metadata: {},
      },
    ],
    [
      {
        source: 'WORKERS',
        niveau: 'ERROR',
        message: 'worker error',
        notificationId: 'notification-1',
        canal: 'IN_APP',
        donnees: {},
        observeLe: new Date().toISOString(),
      },
    ],
  );

  assert.equal(snapshot.totalCycles, 1);
  assert.equal(snapshot.totalJobsTraites, 3);
  assert.equal(snapshot.totalEchecs, 1);
});
