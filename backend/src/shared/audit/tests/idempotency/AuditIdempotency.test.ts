import assert from 'node:assert/strict';
import test from 'node:test';
import { AuditEventIdempotencyGuard } from 'shared/audit/infrastructure/event-bus';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('la garde idempotente empeche de retraiter le meme eventId', () => {
  reinitialiserEtatAuditTests();
  const guard = new AuditEventIdempotencyGuard();
  const envelope = {
    name: 'AuditEntryCreated',
    payload: {},
    metadata: {
      eventId: 'evt-1',
      replay: false,
      retryCount: 0,
      occurredAt: '2026-05-24T10:00:00.000Z',
    },
  };

  assert.equal(guard.dejaTraite(envelope), false);
  guard.marquerTraite(envelope);
  assert.equal(guard.dejaTraite(envelope), true);
});
