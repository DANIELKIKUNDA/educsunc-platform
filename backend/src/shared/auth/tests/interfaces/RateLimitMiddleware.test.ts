import test from 'node:test';
import assert from 'node:assert/strict';
import { RateLimitMiddleware } from 'shared/auth/interfaces/http/middlewares/RateLimitMiddleware';

test('bloque brute-force, limite tentatives login et refresh abusifs', () => {
  const middleware = new RateLimitMiddleware();
  middleware.verifier('login:1.1.1.1', 2, 1000);
  middleware.verifier('login:1.1.1.1', 2, 1000);
  assert.throws(() => middleware.verifier('login:1.1.1.1', 2, 1000));

  middleware.verifier('refresh:1.1.1.1', 1, 1000);
  assert.throws(() => middleware.verifier('refresh:1.1.1.1', 1, 1000));
});
