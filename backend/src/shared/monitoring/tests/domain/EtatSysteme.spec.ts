import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringFactory } from '../factories/MonitoringFactory';

test('EtatSysteme remonte CRITICAL quand un composant critique est present', () => {
  const etat = MonitoringFactory.creerEtatSystemeCritique();

  assert.equal(etat.niveau(), 'CRITICAL');
  assert.equal(etat.details().composants.length, 1);
});


test('M15: EtatSysteme conserve UNKNOWN au lieu de fabriquer HEALTHY', async () => {
  const { EtatSysteme, EtatRuntime, ContexteMonitoring } = await import('../../domain');
  const etat = new EtatSysteme(
    ContexteMonitoring.creer({ composant: 'monitoring' }),
    [],
    [],
    new EtatRuntime({
      niveau: 'UNKNOWN',
      filesActives: [],
      workersActifs: [],
      jobsEnCours: 0,
      jobsEnRetard: 0,
      misAJourLe: new Date(),
    }),
  );

  assert.equal(etat.niveau(), 'UNKNOWN');
});
