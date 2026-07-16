import assert from 'node:assert/strict';
import test from 'node:test';
import { JwtTokenAdapter } from 'shared/auth/infrastructure';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('JWT invalide, forge, expire ou revoque est rejete', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteur = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ADMIN_ECOLE, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  const invalide = await serveur.inject({ method: 'GET', url: '/probe/context', headers: { authorization: 'Bearer invalide', 'x-session-id': acteur.sessionId } });
  assert.equal(invalide.statusCode, 401);

  const tokenForge = await new JwtTokenAdapter('mauvais-secret').genererJwt({ sub: acteur.utilisateurId, sid: acteur.sessionId, tokenVersion: 1 });
  const forge = await serveur.inject({ method: 'GET', url: '/probe/context', headers: { authorization: `Bearer ${tokenForge}`, 'x-session-id': acteur.sessionId } });
  assert.equal(forge.statusCode, 401);

  const tokenExpire = await new JwtTokenAdapter({
    secretJwt: 'dev-secret-change-me',
    dureeAccessTokenSecondes: -1,
  }).genererJwt({ sub: acteur.utilisateurId, sid: acteur.sessionId, tokenVersion: 1 });
  const expire = await serveur.inject({ method: 'GET', url: '/probe/context', headers: { authorization: `Bearer ${tokenExpire}`, 'x-session-id': acteur.sessionId } });
  assert.equal(expire.statusCode, 401);

  await bootstrap.obtenirRevocationGlobaleUseCase().executer({ utilisateurId: acteur.utilisateurId });
  const revoque = await injecterCommeActeur(serveur, acteur, { method: 'GET', url: '/probe/context' });
  assert.equal(revoque.statusCode, 401);

  await serveur.close();
});
