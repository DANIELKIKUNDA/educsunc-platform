import assert from 'node:assert/strict';
import test from 'node:test';
import { AuditJobFactory } from 'shared/audit/infrastructure/workers';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('les contrats workers conservent correlation tenant replay et retry metadata', () => {
  reinitialiserEtatAuditTests();
  const job = new AuditJobFactory().creer(
    'ReplayProjectionJob',
    'PROJECTIONS',
    { projection: 'timeline' },
    {
      correlationId: 'corr-contract',
      requestId: 'req-contract',
      organisationId: 'org-a',
      ecoleId: 'ecole-a',
      replayId: 'replay-contract',
      retryCount: 2,
    },
  );

  assert.equal(job.metadata.correlationId, 'corr-contract');
  assert.equal(job.metadata.requestId, 'req-contract');
  assert.equal(job.metadata.organisationId, 'org-a');
  assert.equal(job.metadata.ecoleId, 'ecole-a');
  assert.equal(job.metadata.replayId, 'replay-contract');
  assert.equal(job.metadata.retryCount, 2);
});
