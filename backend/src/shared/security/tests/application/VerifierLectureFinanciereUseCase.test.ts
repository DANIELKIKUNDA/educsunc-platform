import test from 'node:test';
import assert from 'node:assert/strict';
import { VerifierRestrictionUseCase } from 'shared/security/application';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('lecture financiere applique la restriction metier finances', async () => {
  const { repositories, facade } = creerSecurityFacade();
  const role = creerRole({ codeRole: 'PREFET_ETUDES', permissions: ['paiements.read'] });
  role.ajouterRestriction('INTERDICTION_FINANCES', 'Lecture finance refusee');
  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: role.obtenirId() }));

  const useCase = new VerifierRestrictionUseCase(facade);
  assert.equal(await useCase.executer({ idUtilisateur: 'utilisateur-1', codeRestriction: 'INTERDICTION_FINANCES' }), true);
});
