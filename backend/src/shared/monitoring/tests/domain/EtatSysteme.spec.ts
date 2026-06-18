import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringFactory } from '../factories/MonitoringFactory';

test('EtatSysteme remonte CRITICAL quand un composant critique est present', () => {
  const etat = MonitoringFactory.creerEtatSystemeCritique();

  assert.equal(etat.niveau(), 'CRITICAL');
  assert.equal(etat.details().composants.length, 1);
});
