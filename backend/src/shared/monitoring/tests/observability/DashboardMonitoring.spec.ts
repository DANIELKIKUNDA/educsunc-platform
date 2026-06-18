import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringTestSupport } from '../support/MonitoringTestSupport';
import { FIXTURE_MONITORING_CONTEXT } from '../fixtures/MonitoringFixtures';

test('GetDashboardMonitoringUseCase consolide un tableau de bord complet', async () => {
  const environnement = MonitoringTestSupport.creerEnvironnement();
  await environnement.useCases.createAlert.executer({
    alertId: 'alert-dashboard',
    indicateur: 'error_rate_percent',
    warning: 3,
    critical: 10,
    unite: '%',
    valeurObservee: 11,
    message: 'Erreur critique',
    contexte: { ...FIXTURE_MONITORING_CONTEXT },
    correlationId: FIXTURE_MONITORING_CONTEXT.correlationId,
  });

  const dashboard = await environnement.useCases.getDashboard.executer({
    contexte: { ...FIXTURE_MONITORING_CONTEXT },
  });

  assert.ok(dashboard.alertes.length >= 1);
  assert.ok(dashboard.etatSysteme.composants.length >= 1);
});
