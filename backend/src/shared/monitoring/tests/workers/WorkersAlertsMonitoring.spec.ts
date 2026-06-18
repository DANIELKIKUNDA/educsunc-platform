import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerAlertsMonitoring } from '../../../monitoring';
import { MonitoringCommandFactory } from '../factories/MonitoringCommandFactory';

test('WorkerAlertsMonitoring execute un job de creation d alerte', async () => {
  const worker = new WorkerAlertsMonitoring();
  const resultat = await worker.executer(MonitoringCommandFactory.creerAlerte());

  assert.equal(resultat.worker, 'ALERTS');
  assert.equal(resultat.succes, true);
});
