import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RepositoryAlerteMonitoringMemoire,
  RepositoryIncidentMonitoringMemoire,
  RepositoryTraceMonitoringMemoire,
} from '../../../monitoring';
import { MonitoringFactory } from '../factories/MonitoringFactory';

test('RepositoryAlerteMonitoringMemoire persiste et relit une alerte', async () => {
  const repository = new RepositoryAlerteMonitoringMemoire();
  const alerte = MonitoringFactory.creerAlerte();

  await repository.enregistrerAlerte(alerte);

  assert.equal((await repository.retrouverAlerte(alerte.valeur().identifiant))?.valeur().identifiant, alerte.valeur().identifiant);
});

test('RepositoryIncidentMonitoringMemoire conserve incidents et diagnostics', async () => {
  const repository = new RepositoryIncidentMonitoringMemoire();
  const incident = MonitoringFactory.creerIncident();
  const diagnostic = MonitoringFactory.creerDiagnostic();

  await repository.enregistrerIncident(incident);
  await repository.enregistrerDiagnostic(diagnostic);

  assert.equal((await repository.listerIncidents()).length, 1);
  assert.equal((await repository.listerDiagnostics()).length, 1);
});

test('RepositoryTraceMonitoringMemoire filtre des traces par identifiants', async () => {
  const repository = new RepositoryTraceMonitoringMemoire();
  const trace = MonitoringFactory.creerTrace();

  await repository.enregistrerTrace(trace);

  const traces = await repository.retrouverTraces([trace.valeur().identifiant]);
  assert.equal(traces.length, 1);
});
