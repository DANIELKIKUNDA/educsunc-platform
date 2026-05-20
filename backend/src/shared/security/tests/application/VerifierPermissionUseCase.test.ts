import test from 'node:test';
import assert from 'node:assert/strict';
import { SagaAutorisation, VerifierPermissionUseCase } from 'shared/security/application';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('autorise permission valide et refuse permission absente', async () => {
  const { repositories, permissionCache, facade } = creerSecurityFacade();
  const role = creerRole({ permissions: ['bulletins.read'] });
  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: role.obtenirId() }));
  await permissionCache.memoriserPermissions('utilisateur-1', ['bulletins.read']);

  const useCase = new VerifierPermissionUseCase(new SagaAutorisation(facade));
  assert.equal((await useCase.executer({ idUtilisateur: 'utilisateur-1', permissionDemandee: 'bulletins.read' })).autorise, true);
  assert.equal((await useCase.executer({ idUtilisateur: 'utilisateur-1', permissionDemandee: 'paiements.write' })).autorise, false);
});
