import test from 'node:test';
import assert from 'node:assert/strict';
import { SagaAutorisation, VerifierAccesUseCase } from 'shared/security/application';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('enseignant voit sa classe, caissier accede a la caisse et parent reste limite', async () => {
  const setup = creerSecurityFacade();
  const roleEnseignant = creerRole({ codeRole: 'ENSEIGNANT', permissions: ['cotes.write', 'bulletins.read'] });
  const roleCaissier = creerRole({ codeRole: 'CAISSIER', permissions: ['caisse.write', 'paiements.read'] });
  const roleParent = creerRole({ codeRole: 'PARENT', permissions: ['bulletins.read'] });
  roleParent.ajouterRestriction('INTERDICTION_CAISSE');

  await setup.repositories.roleRepository.sauvegarder(roleEnseignant);
  await setup.repositories.roleRepository.sauvegarder(roleCaissier);
  await setup.repositories.roleRepository.sauvegarder(roleParent);

  await setup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idUtilisateur: 'enseignant', idRole: roleEnseignant.obtenirId() }));
  await setup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idUtilisateur: 'caissier', idRole: roleCaissier.obtenirId() }));
  await setup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idUtilisateur: 'parent', idRole: roleParent.obtenirId() }));

  const useCase = new VerifierAccesUseCase(new SagaAutorisation(setup.facade));
  assert.equal((await useCase.executer({ idUtilisateur: 'enseignant', permissionDemandee: 'bulletins.read', idOrganisation: 'org-1', idEcole: 'ecole-1' })).autorise, true);
  assert.equal((await useCase.executer({ idUtilisateur: 'caissier', permissionDemandee: 'caisse.write', idOrganisation: 'org-1', idEcole: 'ecole-1' })).autorise, true);
  await assert.rejects(() => useCase.executer({ idUtilisateur: 'parent', permissionDemandee: 'caisse.write', idOrganisation: 'org-1', idEcole: 'ecole-1', codeRestriction: 'INTERDICTION_CAISSE' }));
});
