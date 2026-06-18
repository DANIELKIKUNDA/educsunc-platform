import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringConfigurationIntegrationOrchestrator } from '../../../monitoring';

test('MonitoringConfigurationIntegrationOrchestrator applique une mise a jour de seuil', async () => {
  const orchestrator = new MonitoringConfigurationIntegrationOrchestrator();

  await orchestrator.synchroniserEvenement({
    type: 'THRESHOLD_UPDATED',
    cle: 'api_latency_ms',
    valeur: 900,
  });

  const projection = await orchestrator.projectionCourante();
  assert.equal(projection.thresholds.api_latency_ms, 900);
});
