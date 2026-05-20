import test from 'node:test';
import assert from 'node:assert/strict';
import { ScopeMiddleware } from 'shared/security/infrastructure';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('scope valide accepte et ecole etrangere refusee', async () => {
  const { repositories, facade } = creerSecurityFacade();
  const role = creerRole({ permissions: ['roles.read'] });
  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: role.obtenirId(), idOrganisation: 'org-1', idEcole: 'ecole-1' }));

  const middleware = new ScopeMiddleware(facade);
  await middleware.verifier({ idUtilisateur: 'utilisateur-1', idOrganisation: 'org-1', idEcole: 'ecole-1' });
  await assert.rejects(() => middleware.verifier({ idUtilisateur: 'utilisateur-1', idOrganisation: 'org-1', idEcole: 'ecole-9' }));
});
