import assert from 'node:assert/strict';
import test from 'node:test';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { PostgresAuditExportJobStore } from '../../infrastructure/exports/industrialized/PostgresAuditExportJobStore';

test('la relecture export cumule demandeur organisation et ecole', async () => {
  let sqlCapture = '';
  let valeursCapture: readonly unknown[] = [];
  const sql: SqlQueryClient = {
    async executer<TLigne extends object>(requete: string, valeurs = []) {
      sqlCapture = requete; valeursCapture = valeurs;
      return { lignes: [] as readonly TLigne[], nombreLignesAffectees: 0 };
    },
  };
  await new PostgresAuditExportJobStore(sql).lireAutorise('export-devine', {
    requesterId: 'acteur-a', scope: 'ECOLE', organisationId: 'org-a', ecoleId: 'ecole-a',
  });
  assert.match(sqlCapture, /requester_id=\$2/);
  assert.match(sqlCapture, /organisation_id=\$3/);
  assert.match(sqlCapture, /ecole_id=\$4/);
  assert.deepEqual(valeursCapture, ['export-devine', 'acteur-a', 'org-a', 'ecole-a']);
});

test('la reprise distingue fichier publie et generation inachevee', async () => {
  let sqlCapture = '';
  const sql: SqlQueryClient = {
    async executer<TLigne extends object>(requete: string) {
      sqlCapture = requete;
      return { lignes: [] as readonly TLigne[], nombreLignesAffectees: 0 };
    },
  };
  await new PostgresAuditExportJobStore(sql).reprendreTravauxInterrompus();
  assert.match(sqlCapture, /file_key IS NOT NULL THEN 'COMPLETED'/);
  assert.match(sqlCapture, /ELSE 'REQUESTED'/);
});
