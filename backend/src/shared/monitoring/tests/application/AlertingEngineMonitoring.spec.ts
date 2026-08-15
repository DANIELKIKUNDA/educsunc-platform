import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ApplicationAlertingEngineService,
  ApplicationAlertMonitoringService,
  RepositoryAlerteMonitoringMemoire,
} from '../../../monitoring';

const contexte = { utilisateurId: 'manager-systeme', composant: 'monitoring', correlationId: 'corr-m4-test' };

function snapshot(niveau: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN') {
  return {
    etat: {
      contexte,
      niveau,
      composants: [],
      dependances: [{
        nom: 'postgresql', source: 'DATABASE' as const, niveau,
        disponible: niveau === 'HEALTHY', message: `postgresql ${niveau}`, verifieLe: new Date(),
      }],
      runtime: { niveau: 'HEALTHY' as const, filesActives: [], workersActifs: [], jobsEnCours: 0, jobsEnRetard: 0, misAJourLe: new Date() },
    },
    captureLe: new Date(),
    scoreDisponibilite: 100,
  };
}

test('M4 cree une alerte depuis une degradation reelle et la deduplique', async () => {
  const repository = new RepositoryAlerteMonitoringMemoire();
  const service = new ApplicationAlertMonitoringService(repository);
  const moteur = new ApplicationAlertingEngineService(service);

  await moteur.reconciler(snapshot('CRITICAL'), contexte);
  await moteur.reconciler(snapshot('CRITICAL'), contexte);

  const alertes = await repository.listerAlertes();
  assert.equal(alertes.length, 1);
  assert.equal(alertes[0]?.valeur().gravite, 'CRITICAL');
  assert.equal(alertes[0]?.valeur().statut, 'OPEN');
});

test('M4 resout automatiquement l alerte de sante apres retour HEALTHY', async () => {
  const repository = new RepositoryAlerteMonitoringMemoire();
  const service = new ApplicationAlertMonitoringService(repository);
  const moteur = new ApplicationAlertingEngineService(service);

  await moteur.reconciler(snapshot('DEGRADED'), contexte);
  await moteur.reconciler(snapshot('HEALTHY'), contexte);

  const alertes = await repository.listerAlertes();
  assert.equal(alertes.length, 1);
  assert.equal(alertes[0]?.valeur().statut, 'RESOLVED');
  assert.ok(alertes[0]?.valeur().resolueLe instanceof Date);
});

test('M4 UNKNOWN ne fabrique pas une alerte artificielle', async () => {
  const repository = new RepositoryAlerteMonitoringMemoire();
  const moteur = new ApplicationAlertingEngineService(new ApplicationAlertMonitoringService(repository));

  await moteur.reconciler(snapshot('UNKNOWN'), contexte);
  assert.equal((await repository.listerAlertes()).length, 0);
});
