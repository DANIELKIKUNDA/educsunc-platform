import assert from 'node:assert/strict';
import test from 'node:test';
import { ControleurMonitoringHttp } from '../../../monitoring';
import { MonitoringTestSupport } from '../support/MonitoringTestSupport';
import { FIXTURE_MONITORING_CONTEXT } from '../fixtures/MonitoringFixtures';

test('ControleurMonitoringHttp enveloppe l etat systeme avec meta HTTP', async () => {
  const environnement = MonitoringTestSupport.creerEnvironnement();
  const controleur = new ControleurMonitoringHttp(
    environnement.useCases.getSystemState,
    environnement.useCases.getDashboard,
    environnement.useCases.getObservability,
  );

  const reponse = await controleur.consulterEtat({
    query: { ...FIXTURE_MONITORING_CONTEXT },
    headers: { 'x-correlation-id': FIXTURE_MONITORING_CONTEXT.correlationId },
  });

  assert.equal(reponse.statutHttp, 200);
  assert.equal(reponse.meta.correlationId, FIXTURE_MONITORING_CONTEXT.correlationId);
  assert.ok(reponse.corps.composants.length >= 1);
});
