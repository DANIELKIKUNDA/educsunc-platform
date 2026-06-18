import assert from 'node:assert/strict';
import test from 'node:test';
import { ContexteMonitoring, ExceptionCrossTenantMonitoring } from '../../../monitoring';

test('ContexteMonitoring refuse un franchissement cross-tenant', () => {
  const source = ContexteMonitoring.creer({
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
  });
  const cible = ContexteMonitoring.creer({
    organisationId: 'org-b',
    ecoleId: 'ecole-b',
  });

  assert.throws(() => source.verifierCompatibilite(cible), ExceptionCrossTenantMonitoring);
});
