import test from 'node:test';
import assert from 'node:assert/strict';
import { RoleController } from 'shared/security/interfaces/http/controllers';

test('POST, PATCH et GET roles passent par le controller', async () => {
  const controller = new RoleController(
    { executer: async () => ({ idRole: 'r1', codeRole: 'ENSEIGNANT', nomRole: 'Enseignant', niveauAcces: 'ECOLE', estActif: true }) } as never,
    { executer: async () => ({ idRole: 'r1', codeRole: 'ENSEIGNANT', nomRole: 'Enseignant', niveauAcces: 'ECOLE', estActif: true }) } as never,
    { executer: async () => ({ idRole: 'r1', codeRole: 'ENSEIGNANT', nomRole: 'Enseignant', niveauAcces: 'ECOLE', estActif: false }) } as never,
    { executer: async () => ({ codeRole: 'ENSEIGNANT', permissions: ['cotes.write'] }) } as never,
    { executer: async () => ({ codeRole: 'ENSEIGNANT', permissions: [] }) } as never,
    { executer: async () => ({ codeRole: 'ENSEIGNANT', restrictions: ['INTERDICTION_CAISSE'] }) } as never,
    { executer: async () => ({ codeRole: 'ENSEIGNANT', restrictions: [] }) } as never,
    { executer: async () => ([{ idRole: 'r1', codeRole: 'ENSEIGNANT', nomRole: 'Enseignant', niveauAcces: 'ECOLE', estActif: true }]) } as never,
    { executer: async () => ([{ permission: 'cotes.write' }]) } as never,
  );

  assert.equal(((await controller.creer({ codeRole: 'ENSEIGNANT', nomRole: 'Enseignant', niveauAcces: 'ECOLE', permissions: ['cotes.write'] })).donnee as any).success, true);
  assert.equal(((await controller.activer('ENSEIGNANT')).donnee as any).success, true);
  assert.equal(((await controller.listerRoles()).donnee as any).success, true);
});
