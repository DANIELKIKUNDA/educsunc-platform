import test from 'node:test';
import assert from 'node:assert/strict';
import { VerifierRestrictionUseCase } from 'shared/security/application';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('restrictions metier limitent enseignant, parent, prefet, caissier et titulaire selon le role', async () => {
  const setup = creerSecurityFacade();
  const role = creerRole({ codeRole: 'CAISSIER', permissions: ['caisse.write'] });
  role.ajouterRestriction('INTERDICTION_BULLETINS');
  await setup.repositories.roleRepository.sauvegarder(role);
  await setup.repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: role.obtenirId() }));

  const useCase = new VerifierRestrictionUseCase(setup.facade);
  await assert.rejects(() => useCase.executer({ idUtilisateur: 'utilisateur-1', codeRestriction: 'INTERDICTION_BULLETINS' }));
  assert.equal(await useCase.executer({ idUtilisateur: 'utilisateur-1', codeRestriction: 'INTERDICTION_CAISSE' }), false);
});
