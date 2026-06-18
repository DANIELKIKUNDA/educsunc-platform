import assert from 'node:assert/strict';
import test from 'node:test';
import { PresentateurMonitoringHttp } from '../../../monitoring';
import { MonitoringTestSupport } from '../support/MonitoringTestSupport';
import { FIXTURE_MONITORING_CONTEXT } from '../fixtures/MonitoringFixtures';

test('PresentateurMonitoringHttp laisse le tableau de bord stable', async () => {
  const environnement = MonitoringTestSupport.creerEnvironnement();
  const dashboard = await environnement.useCases.getDashboard.executer({
    contexte: { ...FIXTURE_MONITORING_CONTEXT },
  });

  const presente = PresentateurMonitoringHttp.presenterTableauBord(dashboard);
  assert.equal(presente.alertes.length, dashboard.alertes.length);
});
