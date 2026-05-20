import test from 'node:test';
import assert from 'node:assert/strict';
import { PermissionMiddleware } from 'shared/security/infrastructure';
import { creerAffectationUtilisateur, creerRole, creerSecurityFacade } from '../support/SecurityTestSupport';

test('permission valide acceptee, permission absente refusee avec erreur 403 logique', async () => {
  const { repositories, permissionCache, facade } = creerSecurityFacade();
  const role = creerRole({ permissions: ['roles.read'] });
  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({ idRole: role.obtenirId() }));
  await permissionCache.memoriserPermissions('utilisateur-1', ['roles.read']);

  const middleware = new PermissionMiddleware(facade);
  await middleware.verifier({ idUtilisateur: 'utilisateur-1', permissionDemandee: 'roles.read' });
  await assert.rejects(() => middleware.verifier({ idUtilisateur: 'utilisateur-1', permissionDemandee: 'roles.write' }));
});
