import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PolitiqueExpiration,
  PolitiqueRetry,
  PolitiqueSecuriteContenu,
} from 'shared/notifications/domain';

test('les politiques domaine exposent leurs regles principales', () => {
  const politiqueRetry = new PolitiqueRetry('FIXED_RETRY', 4, 15_000);
  const politiqueExpiration = new PolitiqueExpiration('TIME_BASED', new Date('2026-01-01T00:00:00.000Z'));
  const politiqueSecuriteContenu = new PolitiqueSecuriteContenu(['secret-metier']);

  assert.equal(politiqueRetry.obtenirMaximumRetry(), 4);
  assert.equal(politiqueExpiration.estExpiree(new Date('2026-01-02T00:00:00.000Z')), true);
  assert.deepEqual(politiqueSecuriteContenu.obtenirTokensInterdits(), ['secret-metier']);
});
