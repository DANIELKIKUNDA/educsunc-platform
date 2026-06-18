import assert from 'node:assert/strict';
import test from 'node:test';
import { ChronologieNotification } from 'shared/notifications/domain';

test('la politique de chronologie nettoie les identifiants et preserve le mode append-only', () => {
  const chronologie = new ChronologieNotification('FORENSIC', ' corr-1 ', ' req-1 ');

  assert.equal(chronologie.obtenirGranularite(), 'FORENSIC');
  assert.equal(chronologie.obtenirCorrelationId(), 'corr-1');
  assert.equal(chronologie.obtenirRequestId(), 'req-1');
  assert.equal(chronologie.estAppendOnly(), true);
});
