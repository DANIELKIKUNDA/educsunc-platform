import test from 'node:test';
import assert from 'node:assert/strict';
import { SagaAutorisation, VerifierAccesUseCase } from 'shared/security/application';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('caissier est autorise aux paiements, enseignant est refuse', async () => {
  const caisseSetup = creerSecurityFacade();
  const roleCaissier = creerRole({ codeRole: 'CAISSIER', permissions: ['caisse.write', 'paiements.read'] });
  await caisseSetup.repositories.roleRepository.sauvegarder(roleCaissier);
  await caisseSetup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: roleCaissier.obtenirId() }));
  const useCaseOk = new VerifierAccesUseCase(new SagaAutorisation(caisseSetup.facade));
  assert.equal((await useCaseOk.executer({ idUtilisateur: 'utilisateur-1', permissionDemandee: 'caisse.write', idOrganisation: 'org-1', idEcole: 'ecole-1' })).autorise, true);

  const enseignantSetup = creerSecurityFacade();
  const roleEnseignant = creerRole({ codeRole: 'ENSEIGNANT', permissions: ['cotes.write'] });
  await enseignantSetup.repositories.roleRepository.sauvegarder(roleEnseignant);
  await enseignantSetup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: roleEnseignant.obtenirId() }));
  const useCaseRefus = new VerifierAccesUseCase(new SagaAutorisation(enseignantSetup.facade));
  await assert.rejects(() => useCaseRefus.executer({
    idUtilisateur: 'utilisateur-1',
    permissionDemandee: 'caisse.write',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));
});
