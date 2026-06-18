import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerCorrelationTracingMonitoring } from '../../../monitoring';
import { MonitoringFactory } from '../factories/MonitoringFactory';

test('WorkerCorrelationTracingMonitoring regroupe les traces corrélées', () => {
  const worker = new WorkerCorrelationTracingMonitoring();
  const resultat = worker.executer([
    MonitoringFactory.creerTrace(),
    MonitoringFactory.creerTrace({ identifiant: 'trace-monitoring-test-2' }),
  ]);

  assert.equal(resultat.worker, 'TRACING_CORRELATION');
  assert.equal(Object.keys(resultat.resultat as Record<string, unknown>).length, 1);
});
