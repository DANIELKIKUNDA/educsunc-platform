import test from 'node:test';
import assert from 'node:assert/strict';
import { JwtTokenAdapter } from 'shared/auth/infrastructure/adapters/jwt/JwtTokenAdapter';
import { AuthenticationMiddleware } from 'shared/auth/infrastructure/middlewares/AuthenticationMiddleware';

test('login -> JWT -> acces API minimal', async () => {
  const jwt = new JwtTokenAdapter('secret-e2e');
  const token = await jwt.genererJwt({ sub: 'u1', organisationActiveId: 'org-1', ecoleActiveId: 'ecole-1' });
  const payload = await new AuthenticationMiddleware(jwt).authentifier(`Bearer ${token}`);
  assert.equal(payload?.sub, 'u1');
});
