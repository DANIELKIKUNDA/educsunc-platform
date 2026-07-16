import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { verifierSecretJwtProduction } from '../../../../config/auth.config';
import { JwtTokenAdapter } from '../../infrastructure/adapters/jwt/JwtTokenAdapter';

const claims = { sub: 'utilisateur-1', sid: 'session-1', tokenVersion: 3 };
const secret = 'secret-jwt-test-assez-long-pour-edusync';

function construireToken(entete: Record<string, unknown>, payload: Record<string, unknown>): string {
  const enteteEncode = Buffer.from(JSON.stringify(entete)).toString('base64url');
  const payloadEncode = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(`${enteteEncode}.${payloadEncode}`).digest('base64url');
  return `${enteteEncode}.${payloadEncode}.${signature}`;
}

test('JWT Auth porte les claims obligatoires et refuse une autre signature', async () => {
  const emetteur = new JwtTokenAdapter({
    secretJwt: secret,
    emetteur: 'educsyn-test',
    audience: 'educsyn-test-clients',
  });
  const token = await emetteur.genererJwt(claims);
  const payload = await emetteur.decoderJwt<Record<string, unknown>>(token);

  assert.equal(payload.sub, claims.sub);
  assert.equal(payload.sid, claims.sid);
  assert.equal(payload.tokenVersion, claims.tokenVersion);
  assert.equal(payload.iss, 'educsyn-test');
  assert.equal(payload.aud, 'educsyn-test-clients');
  assert.equal(typeof payload.iat, 'number');
  assert.equal(typeof payload.exp, 'number');
  assert.equal(typeof payload.jti, 'string');
  await assert.rejects(() => new JwtTokenAdapter('autre-secret').decoderJwt(token));
});

test('JWT Auth refuse expiration, mauvais issuer et mauvaise audience', async () => {
  const secretJwt = secret;
  const expire = new JwtTokenAdapter({ secretJwt, dureeAccessTokenSecondes: -1 });
  const tokenExpire = await expire.genererJwt(claims);
  await assert.rejects(() => expire.decoderJwt(tokenExpire));

  const source = new JwtTokenAdapter({ secretJwt, emetteur: 'source', audience: 'clients-source' });
  const token = await source.genererJwt(claims);
  await assert.rejects(() => new JwtTokenAdapter({ secretJwt, emetteur: 'autre', audience: 'clients-source' }).decoderJwt(token));
  await assert.rejects(() => new JwtTokenAdapter({ secretJwt, emetteur: 'source', audience: 'autres-clients' }).decoderJwt(token));
});

test('JWT Auth refuse algorithme inattendu et claims obligatoires absents', async () => {
  const adaptateur = new JwtTokenAdapter({ secretJwt: secret, emetteur: 'educsyn-api', audience: 'educsyn-clients' });
  const base = {
    ...claims,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60,
    iss: 'educsyn-api',
    aud: 'educsyn-clients',
    jti: 'jeton-test-1',
  };
  await assert.rejects(() => adaptateur.decoderJwt(construireToken({ alg: 'none', typ: 'JWT' }, base)));
  const { exp: _exp, ...sansExpiration } = base;
  await assert.rejects(() => adaptateur.decoderJwt(construireToken({ alg: 'HS256', typ: 'JWT' }, sansExpiration)));
  const { sid: _sid, ...sansSession } = base;
  await assert.rejects(() => adaptateur.decoderJwt(construireToken({ alg: 'HS256', typ: 'JWT' }, sansSession)));
  const { sub: _sub, ...sansUtilisateur } = base;
  await assert.rejects(() => adaptateur.decoderJwt(construireToken({ alg: 'HS256', typ: 'JWT' }, sansUtilisateur)));
  await assert.rejects(() => adaptateur.decoderJwt(construireToken({ alg: 'HS256', typ: 'JWT' }, { ...base, tokenVersion: 0 })));
});

test('le demarrage production refuse un secret JWT absent ou trop court', () => {
  assert.throws(() => verifierSecretJwtProduction('production'));
  assert.throws(() => verifierSecretJwtProduction('production', 'trop-court'));
  assert.doesNotThrow(() => verifierSecretJwtProduction('production', 'secret-production-educsyn-avec-48-caracteres-minimum'));
  assert.doesNotThrow(() => verifierSecretJwtProduction('development'));

  const environnement: NodeJS.ProcessEnv = { ...process.env, APP_ENV: 'production' };
  delete environnement.EDUCSYN_JWT_SECRET;
  const resultat = spawnSync(
    process.execPath,
    [require.resolve('tsx/cli'), '-e', "import('./src/app/plugins/authentication.plugin.ts')"],
    { cwd: process.cwd(), env: environnement, encoding: 'utf8' },
  );
  assert.notEqual(resultat.status, 0, 'le plugin Auth ne doit pas demarrer sans secret en production');
  assert.match(`${resultat.stderr}${resultat.stdout}`, /EDUCSYN_JWT_SECRET/);
});
