import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringNotificationsIntegrationOrchestrator } from '../../../monitoring';

test('MonitoringNotificationsIntegrationOrchestrator publie un message Monitoring', async () => {
  const orchestrator = new MonitoringNotificationsIntegrationOrchestrator();
  await orchestrator.publierEvenement({
    type: 'ALERT',
    identifiant: 'alert-notif-monitoring',
    severite: 'CRITICAL',
  });

  assert.equal(orchestrator.publisher.lister().length, 1);
});
