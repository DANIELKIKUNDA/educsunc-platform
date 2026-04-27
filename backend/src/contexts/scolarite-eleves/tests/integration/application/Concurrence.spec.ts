import test from 'node:test';
import assert from 'node:assert/strict';
import { ServiceApplicationConcurrence } from '../../../application/services/ServiceApplicationConcurrence';
import { ErreurConcurrenceApplication } from '../../../application/exceptions/ErreurConcurrenceApplication';

test('ServiceApplicationConcurrence accepte la version correcte', () => {
  assert.doesNotThrow(() => new ServiceApplicationConcurrence().verifierVersion(2, 2));
});

test('ServiceApplicationConcurrence refuse la version incorrecte', () => {
  assert.throws(() => new ServiceApplicationConcurrence().verifierVersion(1, 2), ErreurConcurrenceApplication);
});
