import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeForensicDiagnosticsMonitoring } from '../../../monitoring';

test('RuntimeForensicDiagnosticsMonitoring historise les evenements security', () => {
  const forensic = new RuntimeForensicDiagnosticsMonitoring();
  forensic.enregistrer({
    type: 'auth-breach',
    correlationId: 'corr-forensic',
    gravite: 'CRITICAL',
    chargeUtile: { ip: '127.0.0.1' },
    survenanceLe: new Date(),
  });

  assert.equal(forensic.lister().length, 1);
});
