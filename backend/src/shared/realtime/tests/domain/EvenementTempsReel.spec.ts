import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeFactory } from '../factories/RealtimeFactory';

test('EvenementTempsReel reste diffusable quand la valeur utilisateur est positive', () => {
  const evenement = RealtimeFactory.evenement();
  assert.equal(evenement.peutEtreDiffuse(), true);
});
