import test from 'node:test';
import assert from 'node:assert/strict';
import { RestrictionMetierMiddleware } from 'shared/security/infrastructure';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('restriction appliquee et operation non restreinte acceptee', async () => {
  const { repositories, facade } = creerSecurityFacade();
  const role = creerRole({ permissions: ['bulletins.read'] });
  role.ajouterRestriction('INTERDICTION_BULLETINS');
  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: role.obtenirId() }));

  const middleware = new RestrictionMetierMiddleware(facade);
  await assert.rejects(() => middleware.verifier({ idUtilisateur: 'utilisateur-1', codeRestriction: 'INTERDICTION_BULLETINS' }));
  await middleware.verifier({ idUtilisateur: 'utilisateur-1', codeRestriction: 'INTERDICTION_CAISSE' });
});
