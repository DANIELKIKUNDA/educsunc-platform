import assert from 'node:assert/strict';
import test from 'node:test';
import { obtenirDefinitionRoleSysteme } from '../../../security/domain/policies/CatalogueRolesSysteme';

const READ = [
  'monitoring.read','monitoring.dashboard.read','monitoring.observability.read','monitoring.health.read',
  'monitoring.health.snapshot.read','monitoring.incidents.read','monitoring.alerts.read',
  'monitoring.diagnostics.read','monitoring.capacity.read','monitoring.traces.read',
] as const;
const MUTATIONS = [
  'monitoring.incidents.create','monitoring.incidents.escalate','monitoring.alerts.create',
  'monitoring.alerts.resolve','monitoring.diagnostics.create','monitoring.capacity.calculate',
  'monitoring.saturation.calculate','monitoring.traces.create',
] as const;

test('M9 aligne les permissions Monitoring des acteurs Plateforme', () => {
  const manager = obtenirDefinitionRoleSysteme('MANAGER_SYSTEME')!;
  const operateur = obtenirDefinitionRoleSysteme('OPERATEUR_SYSTEME')!;
  const support = obtenirDefinitionRoleSysteme('SUPPORT_SYSTEME')!;
  for (const permission of [...READ, ...MUTATIONS]) {
    assert.ok(manager.permissions.includes(permission), `MANAGER_SYSTEME: ${permission}`);
    assert.ok(operateur.permissions.includes(permission), `OPERATEUR_SYSTEME: ${permission}`);
  }
  for (const permission of READ) assert.ok(support.permissions.includes(permission), `SUPPORT_SYSTEME lecture: ${permission}`);
  for (const permission of MUTATIONS) assert.ok(!support.permissions.includes(permission), `SUPPORT_SYSTEME mutation interdite: ${permission}`);
});

test('M9 refuse Monitoring aux roles non Plateforme', () => {
  for (const code of ['PROMOTEUR_ORGANISATION','ADMIN_SYSTEME_ORGANISATION','ADMINISTRATEUR_ECOLE','ENSEIGNANT']) {
    const role = obtenirDefinitionRoleSysteme(code)!;
    assert.notEqual(role.niveau, 'PLATEFORME');
    assert.ok(!role.permissions.includes('monitoring.read'), `${code} ne doit pas avoir monitoring.read`);
  }
});
