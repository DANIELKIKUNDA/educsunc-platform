import test from 'node:test';
import assert from 'node:assert/strict';
import { JwtInfrastructureService } from 'shared/auth/infrastructure/services/JwtInfrastructureService';

test('signature JWT, verification JWT et extraction claims', async () => {
  const service = new JwtInfrastructureService('secret-test');
  const token = await service.genererJwt({ sub: 'user-1', tokenVersion: 2 });

  assert.equal(await service.verifierJwt(token), true);
  const payload = await service.decoderJwt<{ sub: string; tokenVersion: number }>(token);
  assert.equal(payload.sub, 'user-1');
  assert.equal(payload.tokenVersion, 2);
});

test('rejet JWT falsifie ou invalide', async () => {
  const service = new JwtInfrastructureService('secret-test');
  const token = await service.genererJwt({ sub: 'user-1' });
  const falsifie = `${token}x`;

  assert.equal(await service.verifierJwt(falsifie), false);
  await assert.rejects(() => service.decoderJwt('abc.def'));
});
