import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import test from 'node:test';
import { obtenirClientPostgresAuth, obtenirPoolPostgresAuth } from '../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { PostgresAuditExportJobStore } from '../../infrastructure/exports/industrialized/PostgresAuditExportJobStore';
import { MigrateurPostgresAudit } from '../../infrastructure/persistence/postgres/MigrateurPostgresAudit';
import { AuditRetentionOperationsService } from '../../infrastructure/retention/AuditRetentionOperationsService';
import { PostgresAuditIntegrityStore } from '../../infrastructure/security/integrity/PostgresAuditIntegrityStore';
import { CanonicalAuditProducer } from '../../infrastructure/producers/CanonicalAuditProducer';
import type { AuditCategoryRow, AuditEntryRow } from '../../infrastructure/persistence/postgres/mappers/AuditPersistenceRecords';

const enabled = process.env.EDUCSYN_AUDIT_L5_POSTGRES_TESTS === '1';

test('PostgreSQL certifie exports, retention, integrite et isolation tenant L5', { skip: !enabled }, async () => {
  const pool = obtenirPoolPostgresAuth();
  await new MigrateurPostgresAudit(pool).executerToutes();
  const sql = obtenirClientPostgresAuth();
  const prefixe = `l5-${randomUUID()}`;
  const organisationA = `${prefixe}-org-a`;
  const organisationB = `${prefixe}-org-b`;
  const ecoleA = `${prefixe}-ecole-a`;
  const ecoleB = `${prefixe}-ecole-b`;
  const idEntree = `${prefixe}-audit`;
  const date = '2025-01-01T00:00:00.000Z';
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO audit_entries(
        id_audit_entry,action,type_principal,gravite,niveau,resultat,acteur_id,type_acteur,
        role_actif,type_ressource,id_ressource,organisation_id,ecole_id,scope,source_audit,
        date_action,date_creation_audit
      ) VALUES($1,'AUDIT_CONSULTE','CONSULTATION_SENSIBLE','ELEVEE','CRITIQUE','SUCCESS',
        $2,'UTILISATEUR','MANAGER_SYSTEME','AUDIT',$1,$3,$4,'ECOLE','SYSTEM',$5,$5)`,
      [idEntree, `${prefixe}-acteur`, organisationA, ecoleA, date],
    );
    await client.query('INSERT INTO audit_categories(audit_entry_id,categorie) VALUES($1,$2)', [idEntree, 'SECURITE']);

    const ligne = (await client.query('SELECT * FROM audit_entries WHERE id_audit_entry=$1', [idEntree])).rows[0] as AuditEntryRow;
    const categories = (await client.query(
      'SELECT id,audit_entry_id,categorie FROM audit_categories WHERE audit_entry_id=$1', [idEntree],
    )).rows as AuditCategoryRow[];
    const integrity = new PostgresAuditIntegrityStore(sql);
    await integrity.sceller(ligne, categories);
    assert.equal((await integrity.verifier(idEntree)).statut, 'VALID');

    const canonicalKey = `${prefixe}-canonical`;
    await new CanonicalAuditProducer().produire({
      action: 'AUDIT_CONSULTE', resultat: 'SUCCESS',
      acteur: { id: `${prefixe}-acteur`, type: 'UTILISATEUR', role: 'MANAGER_SYSTEME' },
      tenant: { scope: 'ECOLE', organisationId: organisationA, ecoleId: ecoleA },
      ressource: { type: 'AUDIT', id: `${prefixe}-ressource` },
      contexte: { source: 'SYSTEM' },
      idempotencyKey: canonicalKey,
    });
    const idCanonique = `audit-${createHash('sha256').update(canonicalKey).digest('hex').slice(0, 32)}`;
    assert.equal((await integrity.verifier(idCanonique)).statut, 'VALID');

    const store = new PostgresAuditExportJobStore(sql);
    const exportA = await store.creer({
      idExport: randomUUID(), requesterId: `${prefixe}-acteur`, scope: 'ECOLE',
      organisationId: organisationA, ecoleId: ecoleA, format: 'JSON', filtres: {},
      idempotencyKey: `${prefixe}-export`, expireLe: new Date('2027-01-01T00:00:00.000Z'),
    });
    assert.ok(await store.lireAutorise(exportA.idExport, {
      requesterId: `${prefixe}-acteur`, scope: 'ECOLE', organisationId: organisationA, ecoleId: ecoleA,
    }));
    assert.equal(await store.lireAutorise(exportA.idExport, {
      requesterId: `${prefixe}-acteur`, scope: 'ECOLE', organisationId: organisationB, ecoleId: ecoleB,
    }), null);

    const retention = new AuditRetentionOperationsService({} as never, sql);
    const archive = await retention.archiver({
      scope: 'ECOLE', organisationId: organisationA, ecoleId: ecoleA,
      dateFin: '2025-02-01T00:00:00.000Z', raison: 'Archivage de certification L5',
    });
    assert.equal(archive.valeurs.archives, 1);
    assert.equal((await client.query('SELECT COUNT(*)::int AS total FROM audit_entries WHERE id_audit_entry=$1', [idEntree])).rows[0].total, 1);
    assert.equal((await client.query('SELECT COUNT(*)::int AS total FROM audit_archive_memberships WHERE audit_entry_id=$1', [idEntree])).rows[0].total, 1);
  } finally {
    await client.query('DELETE FROM audit_export_jobs WHERE idempotency_key=$1', [`${prefixe}-export`]);
    await client.query('DELETE FROM audit_retention_runs WHERE requester_id IS NULL AND politique->>\'raison\'=$1', ['Archivage de certification L5']).catch(() => undefined);
    client.release();
    await pool.end();
  }
});
