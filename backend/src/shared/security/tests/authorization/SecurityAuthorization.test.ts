import test from 'node:test';
import assert from 'node:assert/strict';
import { SagaAutorisation, VerifierAccesUseCase } from 'shared/security/application';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('bypass permissions, escalade privileges et acces hors scope sont refuses', async () => {
  const setup = creerSecurityFacade();
  const role = creerRole({ codeRole: 'ENSEIGNANT', permissions: ['cotes.write'] });
  await setup.repositories.roleRepository.sauvegarder(role);
  await setup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: role.obtenirId(), idOrganisation: 'org-1', idEcole: 'ecole-1' }));
  const useCase = new VerifierAccesUseCase(new SagaAutorisation(setup.facade));

  await assert.rejects(() => useCase.executer({ idUtilisateur: 'utilisateur-1', permissionDemandee: 'roles.write', idOrganisation: 'org-1', idEcole: 'ecole-1' }));
  await assert.rejects(() => useCase.executer({ idUtilisateur: 'utilisateur-1', permissionDemandee: 'cotes.write', idOrganisation: 'org-1', idEcole: 'ecole-9' }));
});
