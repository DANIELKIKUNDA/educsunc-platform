import assert from 'node:assert/strict';
import test from 'node:test';
import type { ResultatExecutionSql } from 'shared/infrastructure/persistence/SqlQueryClient';
import type { ClientPostgresReferentielAcademique } from '../infrastructure/persistence/postgres/depots/ClientPostgresReferentielAcademique';
import { ServiceJournalAuditReferentielAcademiquePostgres } from '../infrastructure/services/ServiceJournalAuditReferentielAcademiquePostgres';

class ClientSqlMemoire implements ClientPostgresReferentielAcademique {
  public readonly requetes: string[] = [];
  public async executer<T extends object>(sql: string): Promise<ResultatExecutionSql<T>> {
    this.requetes.push(sql);
    if (sql.includes('INSERT INTO audit_outbox')) {
      return { lignes: [{ id_outbox: 'outbox-ref' }] as T[], nombreLignesAffectees: 1 };
    }
    return { lignes: [], nombreLignesAffectees: 1 };
  }
}

test('le referentiel ecrit dans le pipeline canonique sans alimenter audit_logs', async () => {
  const client = new ClientSqlMemoire();
  const service = new ServiceJournalAuditReferentielAcademiquePostgres(client);
  await service.journaliser({
    action: 'MODIFIER_PONDERATION_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
    acteur: 'manager-1',
    typeRessource: 'REFERENTIEL',
    idRessource: 'version-1',
    details: { correlationId: 'corr-ref-1', password: 'interdit' },
    creeLe: new Date('2026-08-12T10:00:00.000Z'),
  });

  assert.equal(client.requetes.some((sql) => /INSERT INTO "audit_logs"/.test(sql)), false);
  assert.equal(client.requetes.some((sql) => /INSERT INTO audit_outbox/.test(sql)), true);
  assert.equal(client.requetes.some((sql) => /INSERT INTO audit_entries/.test(sql)), true);
});
