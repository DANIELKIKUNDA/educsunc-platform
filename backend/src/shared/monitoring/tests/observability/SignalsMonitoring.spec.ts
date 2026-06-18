import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringCommandFactory } from '../factories/MonitoringCommandFactory';
import { MonitoringTestSupport } from '../support/MonitoringTestSupport';

test('ApplicationObservabilityService publie un signal et une metrique technique', async () => {
  const environnement = MonitoringTestSupport.creerEnvironnement();

  await environnement.services.observability.enregistrerSignal(
    MonitoringCommandFactory.enregistrerSignal(),
  );

  assert.equal(environnement.signaux.lister().length, 1);
  assert.equal((await environnement.metriques.rechercherParFiltre({ valeur: () => ({}) } as never)).length, 1);
});
