import test from 'node:test';
import assert from 'node:assert/strict';
import { EnregistrementIdempotence, ServiceApplicationIdempotence, StoreIdempotenceApplication } from '../../../application/services/ServiceApplicationIdempotence';

class StoreMemoire implements StoreIdempotenceApplication<{ ok: boolean }> {
  public donnees = new Map<string, EnregistrementIdempotence<{ ok: boolean }>>();
  public async trouver(cle: string) { return this.donnees.get(cle) ?? null; }
  public async enregistrer(cleIdempotence: string, empreintePayload: string, sortie: { ok: boolean }) { this.donnees.set(cleIdempotence, { cleIdempotence, empreintePayload, sortie }); }
}

test('ServiceApplicationIdempotence rejoue le meme resultat', async () => {
  const store = new StoreMemoire();
  const service = new ServiceApplicationIdempotence(store);
  await service.enregistrerSortie('cle-1', 'payload', { ok: true });
  assert.deepEqual(await service.trouverSortieDejaTraitee('cle-1', 'payload'), { ok: true });
});
