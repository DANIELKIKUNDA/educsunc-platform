import test from 'node:test';
import assert from 'node:assert/strict';
import { CacheException } from 'contexts/bulletins-evaluations/application/exceptions/CacheException';
import { ConcurrencyApplicationException } from 'contexts/bulletins-evaluations/application/exceptions/ConcurrencyApplicationException';
import { IdempotencyException } from 'contexts/bulletins-evaluations/application/exceptions/IdempotencyException';
import { ServiceCacheBulletin } from 'contexts/bulletins-evaluations/application/services/ServiceCacheBulletin';
import { ServiceIdempotence } from 'contexts/bulletins-evaluations/application/services/ServiceIdempotence';
import { ServiceProjectionLecture } from 'contexts/bulletins-evaluations/application/services/ServiceProjectionLecture';
import { ServiceSynchronisationOffline } from 'contexts/bulletins-evaluations/application/services/ServiceSynchronisationOffline';
import { ServiceValidationConcurrence } from 'contexts/bulletins-evaluations/application/services/ServiceValidationConcurrence';
import { CacheMemoire, IdempotencyPortMemoire } from '../../mocks/BulletinsEvaluationsMocks';
import { creerBulletin } from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre les services applicatifs transverses du BC.
test('les services applicatifs couvrent idempotence, cache, projection, concurrence et sync', async () => {
  const serviceIdempotence = new ServiceIdempotence<{ resultat: string }>(new IdempotencyPortMemoire());
  const cle = serviceIdempotence.exigerCle(' cle-1 ');
  const empreinte = serviceIdempotence.creerEmpreintePayload({ a: 1 });
  await serviceIdempotence.enregistrer(cle, empreinte, { resultat: 'OK' });
  assert.deepEqual(await serviceIdempotence.verifierOuRejouer(cle, empreinte), { resultat: 'OK' });
  await assert.rejects(() => serviceIdempotence.verifierOuRejouer(cle, JSON.stringify({ a: 2 })), IdempotencyException);

  const cache = new CacheMemoire();
  const serviceCache = new ServiceCacheBulletin(cache);
  await serviceCache.enregistrer('bulletin:1', { ok: true }, 60);
  assert.deepEqual(await serviceCache.obtenir('bulletin:1'), { ok: true });
  await serviceCache.invalider('bulletin:1');
  assert.equal(await serviceCache.obtenir('bulletin:1'), null);
  await assert.rejects(() => new ServiceCacheBulletin({
    async obtenir() { throw new Error('KO'); },
    async enregistrer() {},
    async invalider() {},
  }).obtenir('x'), CacheException);

  const projection = new ServiceProjectionLecture().projeterBulletin(creerBulletin());
  assert.equal(projection.idEleve, 'eleve-1');

  new ServiceValidationConcurrence().verifier(1, 1);
  assert.throws(() => new ServiceValidationConcurrence().verifier(1, 2), ConcurrencyApplicationException);

  const serviceSync = new ServiceSynchronisationOffline({
    async enregistrerOperation() {},
    async marquerOperationSynchronisee() {},
  });
  await serviceSync.enregistrer({
    idOperationOffline: 'op-1',
    typeOperation: 'ENCODER_COTE',
    payload: {},
    dateEmission: new Date(),
  });
  const sortieSync = await serviceSync.marquerSynchronisee('op-1');
  assert.equal(sortieSync.statut, 'SYNCHRONISEE');
});
