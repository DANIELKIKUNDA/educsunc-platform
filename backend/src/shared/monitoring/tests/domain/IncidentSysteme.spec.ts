import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringFactory } from '../factories/MonitoringFactory';

test('IncidentSysteme accepte une alerte et un diagnostic puis passe en investigation', () => {
  const incident = MonitoringFactory.creerIncident();
  incident.ajouterAlerte(MonitoringFactory.creerAlerte());
  incident.ajouterDiagnostic(MonitoringFactory.creerDiagnostic());

  assert.equal(incident.details().alertes.length, 1);
  assert.equal(incident.details().diagnostics.length, 1);
  assert.equal(incident.details().statut, 'INVESTIGATING');
});
