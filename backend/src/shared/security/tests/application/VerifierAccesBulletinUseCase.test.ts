import test from 'node:test';
import assert from 'node:assert/strict';
import { SagaAutorisation, VerifierAccesUseCase } from 'shared/security/application';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('enseignant voit ses bulletins et caissier avec restriction est refuse', async () => {
  const enseignantSetup = creerSecurityFacade();
  const roleEnseignant = creerRole({ codeRole: 'ENSEIGNANT', permissions: ['bulletins.read'] });
  await enseignantSetup.repositories.roleRepository.sauvegarder(roleEnseignant);
  await enseignantSetup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: roleEnseignant.obtenirId() }));
  const useCaseOk = new VerifierAccesUseCase(new SagaAutorisation(enseignantSetup.facade));
  assert.equal((await useCaseOk.executer({ idUtilisateur: 'utilisateur-1', permissionDemandee: 'bulletins.read', idOrganisation: 'org-1', idEcole: 'ecole-1' })).autorise, true);

  const caissierSetup = creerSecurityFacade();
  const roleCaissier = creerRole({ codeRole: 'CAISSIER', permissions: ['caisse.write'] });
  roleCaissier.ajouterRestriction('INTERDICTION_BULLETINS', 'Pas de bulletins');
  await caissierSetup.repositories.roleRepository.sauvegarder(roleCaissier);
  await caissierSetup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: roleCaissier.obtenirId() }));
  const useCaseRefus = new VerifierAccesUseCase(new SagaAutorisation(caissierSetup.facade));
  await assert.rejects(() => useCaseRefus.executer({
    idUtilisateur: 'utilisateur-1',
    permissionDemandee: 'bulletins.read',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    codeRestriction: 'INTERDICTION_BULLETINS',
  }));
});
