import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AjouterPermissionRoleUseCase,
  CreerRoleUseCase,
  RetirerPermissionRoleUseCase,
} from 'shared/security/application';
import { creerSecurityRoleService } from '../support/SecurityTestSupport';

test('ajoute et retire une permission sur un role', async () => {
  const { service } = creerSecurityRoleService();
  const creer = new CreerRoleUseCase(service);
  const ajouter = new AjouterPermissionRoleUseCase(service);
  const retirer = new RetirerPermissionRoleUseCase(service);

  await creer.executer({
    codeRole: 'PREFET_ETUDES',
    nomRole: 'Prefet',
    niveauAcces: 'ECOLE',
    permissions: ['bulletins.read'],
  });

  const ajoute = await ajouter.executer({ codeRole: 'PREFET_ETUDES', permission: 'paiements.read' });
  assert.equal(ajoute.permissions.includes('paiements.read'), true);

  const retire = await retirer.executer({ codeRole: 'PREFET_ETUDES', permission: 'paiements.read' });
  assert.equal(retire.permissions.includes('paiements.read'), false);
});
