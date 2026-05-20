import test from 'node:test';
import assert from 'node:assert/strict';
import { PermissionCacheService } from 'shared/security/infrastructure';
import { creerSecurityRoleService } from '../support/SecurityTestSupport';

test('propagation permissions et invalidation cache lors d un changement de role', async () => {
  const { service } = creerSecurityRoleService();
  const cache = new PermissionCacheService();

  await cache.memoriserPermissions('utilisateur-1', ['bulletins.read']);
  await service.creerRole({
    codeRole: 'DIRECTEUR_ETUDES',
    nomRole: 'Directeur',
    niveauAcces: 'ECOLE',
    permissions: ['bulletins.read'],
  });
  await service.ajouterPermission({ codeRole: 'DIRECTEUR_ETUDES', permission: 'paiements.read' });
  await cache.invaliderPermissions('utilisateur-1');

  assert.equal(await cache.obtenirPermissions('utilisateur-1'), null);
});
