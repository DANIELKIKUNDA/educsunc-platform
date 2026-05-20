import test from 'node:test';
import assert from 'node:assert/strict';
import { RoleController } from 'shared/security/interfaces/http/controllers';

test('POST, GET et DELETE permissions passent par le controller de roles', async () => {
  const controller = new RoleController(
    { executer: async () => ({}) } as never,
    { executer: async () => ({}) } as never,
    { executer: async () => ({}) } as never,
    { executer: async () => ({ codeRole: 'ENSEIGNANT', permissions: ['cotes.write'] }) } as never,
    { executer: async () => ({ codeRole: 'ENSEIGNANT', permissions: [] }) } as never,
    { executer: async () => ({ codeRole: 'ENSEIGNANT', restrictions: [] }) } as never,
    { executer: async () => ({ codeRole: 'ENSEIGNANT', restrictions: [] }) } as never,
    { executer: async () => [] } as never,
    { executer: async () => ([{ permission: 'cotes.write' }]) } as never,
  );

  assert.equal(((await controller.ajouterPermission('ENSEIGNANT', { permission: 'cotes.write' })).donnee as any).success, true);
  assert.equal(((await controller.listerPermissions('ENSEIGNANT')).donnee as any).success, true);
  assert.equal(((await controller.retirerPermission('ENSEIGNANT', 'cotes.write')).donnee as any).success, true);
});
