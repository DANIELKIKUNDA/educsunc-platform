import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringNotFoundException, WorkerDiagnosticsMonitoring } from '../../../monitoring';
import { MonitoringCommandFactory } from '../factories/MonitoringCommandFactory';

test('WorkerDiagnosticsMonitoring refuse un diagnostic si l incident n existe pas dans son runtime', async () => {
  const worker = new WorkerDiagnosticsMonitoring();
  await assert.rejects(
    () => worker.executer(MonitoringCommandFactory.genererDiagnostic()),
    MonitoringNotFoundException,
  );
});
