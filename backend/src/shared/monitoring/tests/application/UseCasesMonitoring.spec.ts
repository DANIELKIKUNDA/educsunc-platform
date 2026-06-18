import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringCommandFactory } from '../factories/MonitoringCommandFactory';
import { MonitoringTestSupport } from '../support/MonitoringTestSupport';

test('CreateAlertUseCase cree une alerte critique', async () => {
  const environnement = MonitoringTestSupport.creerEnvironnement();

  const resultat = await environnement.useCases.createAlert.executer(
    MonitoringCommandFactory.creerAlerte(),
  );

  assert.equal(resultat.statut, 'OPEN');
  assert.equal(resultat.gravite, 'CRITICAL');
});

test('GetSystemStateUseCase produit un etat systeme coherent', async () => {
  const environnement = MonitoringTestSupport.creerEnvironnement();

  const resultat = await environnement.useCases.getSystemState.executer({
    contexte: MonitoringCommandFactory.creerAlerte().contexte,
  });

  assert.equal(resultat.runtime.jobsEnCours, 0);
  assert.ok(resultat.composants.length >= 1);
});
