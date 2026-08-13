import assert from 'node:assert/strict';
import test from 'node:test';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import type { AuditReadRepositoryPort } from '../../application/ports/outbound/AuditReadRepositoryPort';
import { AuditReplayOperationsService } from '../../infrastructure/replay/AuditReplayOperationsService';

test('le dry run est idempotent et ne declenche aucune projection', async () => {
  let insertion = 0;
  let projections = 0;
  const sql: SqlQueryClient = {
    async executer<TLigne extends object>(requete: string) {
      if (requete.includes('INSERT INTO audit_replay_runs')) {
        insertion += 1;
        const resultat = insertion === 1
          ? { lignes: [{ id_replay: 'replay-a', statut: 'VALIDATED', cible: 'PROJECTIONS', mode: 'DRY_RUN', resultat: null, erreur: null }], nombreLignesAffectees: 1 }
          : { lignes: [], nombreLignesAffectees: 0 };
        return { ...resultat, lignes: resultat.lignes as unknown as readonly TLigne[] };
      }
      if (requete.includes('SELECT * FROM audit_replay_runs')) {
        return { lignes: [{ id_replay: 'replay-a', statut: 'VALIDATED', cible: 'PROJECTIONS', mode: 'DRY_RUN', resultat: { evenementsCompatibles: 0 }, erreur: null }] as unknown as readonly TLigne[], nombreLignesAffectees: 1 };
      }
      return { lignes: [] as readonly TLigne[], nombreLignesAffectees: 1 };
    },
  };
  const lectures: AuditReadRepositoryPort = {
    async rechercher() { return { items: [], hasNextPage: false }; },
    async obtenirParId() { return null; },
    async compter() { return { total: 0, critiques: 0, echecs: 0, exports: 0, securite: 0, replays: 0, retries: 0 }; },
  };
  const service = new AuditReplayOperationsService(
    lectures,
    { trouverParId: async () => null } as never,
    { traiterAuditEntryCreated: async () => { projections += 1; } } as never,
    sql,
  );
  const payload = { cible: 'PROJECTIONS', mode: 'DRY_RUN', replayId: 'demande-a', raison: 'Reconstruction de verification', scope: 'PLATEFORME' };
  const premier = await service.executer(payload);
  const second = await service.executer(payload);
  assert.equal(premier.statut, 'VALIDATED');
  assert.equal(second.idempotent, true);
  assert.equal(projections, 0);
});

test('un replay hors whitelist est refuse', async () => {
  const service = new AuditReplayOperationsService({} as never, {} as never, {} as never, {} as never);
  await assert.rejects(() => service.executer({ cible: 'PAIEMENT', raison: 'Tentative de replay paiement', scope: 'PLATEFORME' }), /Seules les reconstructions/);
});
