import assert from 'node:assert/strict';
import test from 'node:test';
import { PostgresIdempotencyStore } from 'shared/infrastructure/idempotency/PostgresIdempotencyStore';
import type { SqlQueryClient } from 'shared/infrastructure/persistence/SqlQueryClient';

class SqlQueryClientIdempotenceMock implements SqlQueryClient {
  private readonly stock = new Map<string, {
    cle: string;
    statut: string;
    operation: string | null;
    empreinte_requete: string | null;
    resultat: Record<string, unknown> | string | null;
    expire_le: Date | string | null;
    cree_le: Date | string;
  }>();

  public async executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<{ lignes: readonly TLigne[]; nombreLignesAffectees: number }> {
    if (requeteSql.startsWith('DELETE FROM "idempotency_keys" WHERE "cle"')) {
      return { lignes: [], nombreLignesAffectees: 0 };
    }

    if (requeteSql.startsWith('INSERT INTO "idempotency_keys"')) {
      const cle = String(parametres[1]);
      if (!this.stock.has(cle)) {
        this.stock.set(cle, {
          cle,
          operation: (parametres[2] as string | null) ?? null,
          statut: String(parametres[3]),
          empreinte_requete: (parametres[4] as string | null) ?? null,
          resultat: (parametres[5] as string | null) ?? null,
          expire_le: (parametres[6] as Date | null) ?? null,
          cree_le: new Date(),
        });
      }
      return { lignes: [], nombreLignesAffectees: 1 };
    }

    if (requeteSql.startsWith('UPDATE "idempotency_keys"')) {
      const cle = String(parametres[0]);
      const ligne = this.stock.get(cle);
      if (!ligne) {
        return { lignes: [], nombreLignesAffectees: 0 };
      }
      ligne.statut = String(parametres[1]);
      ligne.resultat = (parametres[2] as string | null) ?? null;
      return { lignes: [], nombreLignesAffectees: 1 };
    }

    if (requeteSql.startsWith('SELECT 1 AS correspondance')) {
      const cle = String(parametres[0]);
      return { lignes: this.stock.has(cle) ? ([{ correspondance: 1 }] as TLigne[]) : [], nombreLignesAffectees: 0 };
    }

    if (requeteSql.startsWith('SELECT "cle", "statut"')) {
      const cle = String(parametres[0]);
      const ligne = this.stock.get(cle);
      return { lignes: ligne ? ([ligne] as TLigne[]) : [], nombreLignesAffectees: 0 };
    }

    if (requeteSql.startsWith('DELETE FROM "idempotency_keys" WHERE "expire_le"')) {
      return { lignes: [], nombreLignesAffectees: 0 };
    }

    return { lignes: [], nombreLignesAffectees: 0 };
  }
}

test('le rejeu idempotent retourne un enregistrement unique', async () => {
  const store = new PostgresIdempotencyStore(new SqlQueryClientIdempotenceMock());
  await store.enregistrer({ cle: 'idempo-1', statut: 'PENDING', operation: 'test' });
  await store.marquerResultat('idempo-1', 'DONE', { ok: true });
  const enregistrement = await store.obtenir('idempo-1');
  assert.ok(enregistrement);
  assert.equal(enregistrement?.statut, 'DONE');
  assert.equal(await store.existe('idempo-1'), true);
});
