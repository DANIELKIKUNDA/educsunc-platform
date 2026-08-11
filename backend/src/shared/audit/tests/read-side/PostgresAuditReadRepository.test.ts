import assert from 'node:assert/strict';
import test from 'node:test';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { PostgresAuditReadRepository } from '../../infrastructure/persistence/postgres/repositories/PostgresAuditReadRepository';

test('la recherche PostgreSQL applique tenant, keyset, filtres whitelistes et limite plus un', async () => {
  let sql = '';
  let parametres: readonly unknown[] = [];
  const client: SqlQueryClient = {
    async executer(requete, valeurs = []) {
      sql = requete;
      parametres = valeurs;
      return { lignes: [], nombreLignesAffectees: 0 };
    },
  };
  const depot = new PostgresAuditReadRepository(client);
  await depot.rechercher(
    {
      organisationId: 'org-a',
      ecoleId: 'ecole-a',
      categorieAudit: 'SECURITE',
      requestId: 'request-l3',
    },
    {
      limite: 25,
      position: { dateAction: '2026-08-11T10:00:00.000Z', idAuditEntry: 'audit-100' },
    },
  );

  assert.match(sql, /e\.organisation_id=\$1/);
  assert.match(sql, /e\.ecole_id=\$2/);
  assert.match(sql, /EXISTS\(SELECT 1 FROM audit_categories/);
  assert.match(sql, /\(e\.date_action,e\.id_audit_entry\) </);
  assert.match(sql, /ORDER BY e\.date_action DESC,e\.id_audit_entry DESC/);
  assert.match(sql, /LIMIT \$7/);
  assert.doesNotMatch(sql, /SELECT e\.\*/);
  assert.deepEqual(parametres, [
    'org-a', 'ecole-a', 'request-l3', 'SECURITE',
    '2026-08-11T10:00:00.000Z', 'audit-100', 26,
  ]);
});

test('le detail PostgreSQL filtre le tenant avant l identifiant', async () => {
  let sql = '';
  let parametres: readonly unknown[] = [];
  const client: SqlQueryClient = {
    async executer(requete, valeurs = []) {
      sql = requete;
      parametres = valeurs;
      return { lignes: [], nombreLignesAffectees: 0 };
    },
  };
  const resultat = await new PostgresAuditReadRepository(client).obtenirParId({
    idAuditEntry: 'audit-b', organisationId: 'org-a', ecoleId: 'ecole-a', scope: 'ECOLE',
  });

  assert.equal(resultat, null);
  assert.match(sql, /e\.id_audit_entry=\$1/);
  assert.match(sql, /e\.organisation_id=\$2/);
  assert.match(sql, /e\.ecole_id=\$3/);
  assert.deepEqual(parametres, ['audit-b', 'org-a', 'ecole-a']);
});
