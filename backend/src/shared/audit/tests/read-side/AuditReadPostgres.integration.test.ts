import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { AuditSearchApplicationService } from '../../application/services/AuditSearchApplicationService';
import { MigrateurPostgresAudit } from '../../infrastructure/persistence/postgres/MigrateurPostgresAudit';
import { PostgresAuditReadRepository } from '../../infrastructure/persistence/postgres/repositories/PostgresAuditReadRepository';
import { obtenirPoolPostgresAuth } from '../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

const enabled = process.env.EDUCSYN_AUDIT_READ_POSTGRES_TESTS === '1';

test('PostgreSQL certifie recherches, keyset, filtres, index et isolation tenant L3', {
  skip: !enabled,
}, async () => {
  const pool = obtenirPoolPostgresAuth();
  await new MigrateurPostgresAudit(pool).executerToutes();
  const prefixe = `l3-${randomUUID()}`;
  const organisationA = `${prefixe}-org-a`;
  const organisationB = `${prefixe}-org-b`;
  const ecoleA = `${prefixe}-ecole-a`;
  const ecoleB = `${prefixe}-ecole-b`;
  const dateBase = new Date('2026-08-11T12:00:00.000Z');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index = 0; index < 240; index += 1) {
      const organisationId = index < 200 ? organisationA : organisationB;
      const ecoleId = index < 180 ? ecoleA : ecoleB;
      const dateAction = new Date(dateBase.getTime() - Math.floor(index / 3) * 1_000);
      const id = `${prefixe}-audit-${String(index).padStart(4, '0')}`;
      await client.query(
        `INSERT INTO audit_entries (
           id_audit_entry,action,type_principal,gravite,niveau,resultat,request_id,
           correlation_id,acteur_id,type_acteur,role_actif,type_ressource,id_ressource,
           organisation_id,ecole_id,scope,mode_offline,retry_count,est_replay,est_retry,
           source_audit,date_action,date_creation_audit
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,FALSE,0,FALSE,FALSE,$17,$18,$18)`,
        [
          id,
          index % 2 === 0 ? 'CONSULTER_AUDIT' : 'EXPORTER_AUDIT',
          'GOUVERNANCE',
          index % 10 === 0 ? 'ELEVEE' : 'INFO',
          'METIER',
          index % 11 === 0 ? 'ECHEC' : 'SUCCES',
          `${prefixe}-request-${index}`,
          `${prefixe}-correlation-${index % 7}`,
          `${prefixe}-acteur-${index % 5}`,
          'UTILISATEUR',
          'MANAGER_SYSTEME',
          'AUDIT_ENTRY',
          `${prefixe}-ressource-${index % 9}`,
          organisationId,
          ecoleId,
          'ECOLE',
          'SYSTEM',
          dateAction.toISOString(),
        ],
      );
      await client.query(
        'INSERT INTO audit_categories(audit_entry_id,categorie) VALUES ($1,$2)',
        [id, index % 2 === 0 ? 'CONSULTATION' : 'EXPORT'],
      );
    }
    await client.query('COMMIT');
  } catch (erreur) {
    await client.query('ROLLBACK');
    throw erreur;
  } finally {
    client.release();
  }

  await pool.query('ANALYZE audit_entries');
  const depot = new PostgresAuditReadRepository();
  const service = new AuditSearchApplicationService(depot);
  const premiere = await service.rechercherAudits({
    organisationId: organisationA,
    ecoleId: ecoleA,
    taillePage: 37,
  });
  assert.equal(premiere.items.length, 37);
  assert.equal(premiere.hasNextPage, true);
  assert.ok(premiere.nextCursor);
  assert.ok(premiere.items.every((item) => item.organisationId === organisationA && item.ecoleId === ecoleA));

  const evenementConcurrent = `${prefixe}-audit-concurrent`;
  await pool.query(
    `INSERT INTO audit_entries (
       id_audit_entry,action,type_principal,gravite,niveau,resultat,type_acteur,
       organisation_id,ecole_id,scope,source_audit,date_action,date_creation_audit
     ) VALUES ($1,'CONSULTER_AUDIT','GOUVERNANCE','INFO','METIER','SUCCES','UTILISATEUR',$2,$3,'ECOLE','SYSTEM',NOW(),NOW())`,
    [evenementConcurrent, organisationA, ecoleA],
  );
  const suivante = await service.rechercherAudits({
    organisationId: organisationA,
    ecoleId: ecoleA,
    taillePage: 37,
    cursor: premiere.nextCursor,
  });
  const idsPremiere = new Set(premiere.items.map((item) => item.idAuditEntry));
  assert.ok(suivante.items.every((item) => !idsPremiere.has(item.idAuditEntry)));
  assert.ok(suivante.items.every((item) => item.idAuditEntry !== evenementConcurrent));

  const filtree = await service.rechercherAudits({
    organisationId: organisationA,
    ecoleId: ecoleA,
    categorieAudit: 'EXPORT',
    resultat: 'SUCCES',
    taillePage: 100,
  });
  assert.ok(filtree.items.length > 0);
  assert.ok(filtree.items.every((item) => item.categories.includes('EXPORT') && item.resultat === 'SUCCES'));

  const idAccessible = premiere.items[0]?.idAuditEntry;
  assert.ok(idAccessible);
  const detailAccessible = await service.consulterAudit({
    idAuditEntry: idAccessible,
    organisationId: organisationA,
    ecoleId: ecoleA,
  });
  assert.equal(detailAccessible.idAuditEntry, idAccessible);
  await assert.rejects(
    service.consulterAudit({ idAuditEntry: idAccessible, organisationId: organisationB, ecoleId: ecoleB }),
    /introuvable/,
  );
  await assert.rejects(
    service.rechercherAudits({ organisationId: organisationB, ecoleId: ecoleB, cursor: premiere.nextCursor }),
    /curseur de pagination est invalide/,
  );

  const indexes = await pool.query<{ indexname: string }>(
    `SELECT indexname FROM pg_indexes
     WHERE (tablename IN ('audit_entries','audit_categories') AND indexname LIKE '%keyset%')
        OR indexname='audit_categories_lookup_idx'`,
  );
  const nomsIndexes = new Set(indexes.rows.map((ligne) => ligne.indexname));
  assert.ok(nomsIndexes.has('audit_entries_keyset_idx'));
  assert.ok(nomsIndexes.has('audit_entries_organisation_keyset_idx'));
  assert.ok(nomsIndexes.has('audit_entries_ecole_keyset_idx'));
  assert.ok(nomsIndexes.has('audit_categories_lookup_idx'));

  const explain = await pool.query<{ 'QUERY PLAN': string }>(
    `EXPLAIN (ANALYZE,BUFFERS)
     SELECT id_audit_entry,date_action FROM audit_entries
     WHERE organisation_id=$1 AND ecole_id=$2
       AND (date_action,id_audit_entry) < ($3::timestamptz,$4::text)
     ORDER BY date_action DESC,id_audit_entry DESC LIMIT 38`,
    [
      organisationA,
      ecoleA,
      premiere.items.at(-1)?.dateAction,
      premiere.items.at(-1)?.idAuditEntry,
    ],
  );
  const plan = explain.rows.map((ligne) => ligne['QUERY PLAN']).join('\n');
  assert.doesNotMatch(plan, /Offset:/i);
  assert.match(plan, /Limit/);
});
