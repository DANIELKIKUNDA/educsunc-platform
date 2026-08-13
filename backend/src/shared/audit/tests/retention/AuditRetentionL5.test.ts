import assert from 'node:assert/strict';
import test from 'node:test';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { AuditRetentionOperationsService } from '../../infrastructure/retention/AuditRetentionOperationsService';

test('la purge reste un apercu et n emet aucune suppression SQL', async () => {
  const requetes: string[] = [];
  const sql: SqlQueryClient = {
    async executer<TLigne extends object>(requete: string) {
      requetes.push(requete);
      if (requete.includes('COUNT(*)')) return { lignes: [{ total: '7' }] as unknown as readonly TLigne[], nombreLignesAffectees: 0 };
      return { lignes: [] as readonly TLigne[], nombreLignesAffectees: 1 };
    },
  };
  const service = new AuditRetentionOperationsService({} as never, sql);
  const resultat = await service.apercuPurge({ scope: 'PLATEFORME', dateFin: '2025-01-01T00:00:00.000Z' });
  assert.equal(resultat.valeurs.candidatsPurge, 7);
  assert.equal(resultat.valeurs.purgeExecutee, 0);
  assert.equal(requetes.some((requete) => /DELETE\s+FROM\s+audit_entries/i.test(requete)), false);
});

test('aucune retention n invente une date limite', async () => {
  const service = new AuditRetentionOperationsService({} as never, {} as never);
  await assert.rejects(() => service.preparer({ scope: 'PLATEFORME' }), /date limite explicite/);
});
