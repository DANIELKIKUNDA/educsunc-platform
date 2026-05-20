import test from 'node:test';
import assert from 'node:assert/strict';
import { ScopeCacheService } from 'shared/security/infrastructure';

test('cache scopes, invalidate scopes et refresh scopes', async () => {
  const service = new ScopeCacheService();
  await service.memoriserScopes('u1', [{ typeScope: 'ECOLE', valeurScope: 'ecole-1', estLectureSeule: false }]);
  assert.equal((await service.obtenirScopes('u1'))?.length, 1);

  await service.memoriserScopes('u1', [{ typeScope: 'ORGANISATION', valeurScope: 'org-1', estLectureSeule: true }]);
  assert.equal((await service.obtenirScopes('u1'))?.[0]?.typeScope, 'ORGANISATION');

  await service.invaliderScopes('u1');
  assert.equal(await service.obtenirScopes('u1'), null);
});
