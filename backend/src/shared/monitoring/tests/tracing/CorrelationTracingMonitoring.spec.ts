import assert from 'node:assert/strict';
import test from 'node:test';
import { CorrelationTracesMonitoring } from '../../../monitoring';
import { MonitoringFactory } from '../factories/MonitoringFactory';

test('CorrelationTracesMonitoring regroupe les traces par correlationId', () => {
  const service = new CorrelationTracesMonitoring();
  const groupes = service.regrouper([
    MonitoringFactory.creerTrace(),
    MonitoringFactory.creerTrace({ identifiant: 'trace-monitoring-test-2' }),
  ]);

  assert.equal(Object.keys(groupes).length, 1);
  assert.equal(groupes['corr-monitoring-test'].length, 2);
});
