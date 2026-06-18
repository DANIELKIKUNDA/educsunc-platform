import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringSecurityIntegrationOrchestrator } from '../../../monitoring';

test('MonitoringSecurityIntegrationOrchestrator bloque un type critique deja observe', async () => {
  const orchestrator = new MonitoringSecurityIntegrationOrchestrator();

  await orchestrator.synchroniserEvenement({
    type: 'AUTH_BRUTE_FORCE',
    correlationId: 'corr-security-monitoring',
    gravite: 'CRITICAL',
    chargeUtile: { ip: '127.0.0.1' },
    survenanceLe: new Date(),
  });

  const decision = await orchestrator.evaluer('AUTH_BRUTE_FORCE');
  assert.equal(decision.autorise, false);
  assert.equal(decision.raison, 'Evenement critique deja observe');
});
