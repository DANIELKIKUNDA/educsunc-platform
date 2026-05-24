import assert from 'node:assert/strict';
import test from 'node:test';
import { obtenirSharedEventBus } from 'shared/infrastructure/bus';
import { AuditTraceService } from 'shared/audit/infrastructure/monitoring';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('les traces Audit reconstruisent requestId correlationId traceId et contexte worker', async () => {
  reinitialiserEtatAuditTests();
  await obtenirSharedEventBus().publier(
    'WorkerFailed',
    { workerId: 'worker-1', queueName: 'MONITORING' },
    {
      requestId: 'req-trace',
      correlationId: 'corr-trace',
      traceId: 'trace-1',
      spanId: 'span-1',
      organisationId: 'org-a',
      ecoleId: 'ecole-a',
      retryCount: 1,
    },
  );

  const traces = new AuditTraceService().lister();
  assert.equal(traces.length, 1);
  assert.equal(traces[0]?.traceId, 'trace-1');
  assert.equal(traces[0]?.workerId, 'worker-1');
  assert.equal(traces[0]?.queueName, 'MONITORING');
  assert.equal(traces[0]?.retryCount, 1);
});
