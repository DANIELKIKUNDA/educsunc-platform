import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import type { PoolClient } from 'pg';
import { AuditCanonicalWriteService, AuditOutboxDeliveryService } from '../../application/services';
import type { AuditOutboxPublisherPort } from '../../application/ports/outbound';
import { AuditCanonicalEventMapper } from '../../infrastructure/outbox';
import { MigrateurPostgresAudit } from '../../infrastructure/persistence/postgres/MigrateurPostgresAudit';
import { AuditEntryPersistenceMapper } from '../../infrastructure/persistence/postgres/mappers/AuditEntryPersistenceMapper';
import type { AuditEntryRow } from '../../infrastructure/persistence/postgres/mappers/AuditPersistenceRecords';
import {
  PostgresAuditCanonicalStorage,
  PostgresAuditOutboxRepository,
} from '../../infrastructure/persistence/postgres/repositories';
import { obtenirPoolPostgresAuth } from '../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';

const enabled = process.env.EDUCSYN_AUDIT_OUTBOX_POSTGRES_TESTS === '1';

class FixedPgClient implements SqlQueryClient {
  public constructor(private readonly client: PoolClient) {}

  public async executer<TLine extends object = Record<string, unknown>>(
    query: string,
    parameters: readonly unknown[] = [],
  ) {
    const result = await this.client.query(query, [...parameters]);
    return {
      lignes: result.rows as readonly TLine[],
      nombreLignesAffectees: result.rowCount ?? 0,
    };
  }
}

function buildEntry(eventId: string, idempotencyKey: string): ReturnType<typeof AuditEntryPersistenceMapper.depuisRows> {
  const now = new Date().toISOString();
  const row: AuditEntryRow = {
    id_audit_entry: eventId,
    action: 'PAIEMENT_CREE',
    type_principal: 'FINANCIER',
    gravite: 'ELEVEE',
    niveau: 'CRITIQUE',
    resultat: 'SUCCESS',
    request_id: `request-${eventId}`,
    correlation_id: idempotencyKey,
    session_id: null,
    sync_id: null,
    replay_id: null,
    acteur_id: 'l2-certification-user',
    type_acteur: 'UTILISATEUR',
    role_actif: 'CAISSIER',
    type_ressource: 'PAIEMENT',
    id_ressource: idempotencyKey,
    libelle_ressource: 'Certification L2',
    organisation_id: 'l2-certification-organisation',
    ecole_id: 'l2-certification-ecole',
    scope: 'ECOLE',
    mode_offline: false,
    statut_synchronisation: null,
    retry_count: 0,
    est_replay: false,
    est_retry: false,
    adresse_ip: null,
    user_agent: null,
    device_id: null,
    source_audit: 'CERTIFICATION_L2',
    source_runtime: 'HTTP_API',
    version_application: null,
    date_action: now,
    date_creation_audit: now,
    date_synchronisation: null,
    ancien_etat: null,
    nouvel_etat: { certification: true },
    metadata: { certification: 'L2' },
    contexte_permissions: {
      rolesActifs: ['CAISSIER'],
      permissionsActives: ['paiements.write'],
      scopesActifs: ['ORGANISATION:l2-certification-organisation', 'ECOLE:l2-certification-ecole'],
    },
    contexte_execution: { modeExecution: 'SYNCHRONE' },
  };
  return AuditEntryPersistenceMapper.depuisRows(row, [
    { id: 1, audit_entry_id: eventId, categorie: 'FINANCIER' },
    { id: 2, audit_entry_id: eventId, categorie: 'METIER' },
  ]);
}

test('PostgreSQL garantit atomicite, reprise, idempotence et verrouillage concurrent L2', {
  skip: !enabled,
}, async () => {
  const pool = obtenirPoolPostgresAuth();
  await new MigrateurPostgresAudit(pool).executerToutes();

  const rollbackEventId = `audit-l2-rollback-${randomUUID()}`;
  const rollbackKey = `l2:rollback:${rollbackEventId}`;
  const rollbackClient = await pool.connect();
  try {
    await rollbackClient.query('BEGIN');
    const fixedClient = new FixedPgClient(rollbackClient);
    const service = new AuditCanonicalWriteService(
      new PostgresAuditCanonicalStorage(fixedClient),
      new AuditCanonicalEventMapper(),
    );
    await service.ecrire(buildEntry(rollbackEventId, rollbackKey), rollbackKey);
    await rollbackClient.query('ROLLBACK');
  } finally {
    rollbackClient.release();
  }
  const rollbackCheck = await pool.query(
    `SELECT
       EXISTS(SELECT 1 FROM audit_entries WHERE id_audit_entry=$1) AS entry_exists,
       EXISTS(SELECT 1 FROM audit_outbox WHERE event_id=$1) AS outbox_exists`,
    [rollbackEventId],
  );
  assert.equal(rollbackCheck.rows[0].entry_exists, false);
  assert.equal(rollbackCheck.rows[0].outbox_exists, false);

  const eventId = `audit-l2-commit-${randomUUID()}`;
  const key = `l2:commit:${eventId}`;
  const commitClient = await pool.connect();
  try {
    await commitClient.query('BEGIN');
    await commitClient.query('CREATE TEMP TABLE IF NOT EXISTS l2_business_commit (id TEXT PRIMARY KEY)');
    await commitClient.query('INSERT INTO l2_business_commit(id) VALUES ($1)', [eventId]);
    const fixedClient = new FixedPgClient(commitClient);
    const service = new AuditCanonicalWriteService(
      new PostgresAuditCanonicalStorage(fixedClient),
      new AuditCanonicalEventMapper(),
    );
    const first = await service.ecrire(buildEntry(eventId, key), key);
    assert.equal(first.duplicate, false);
    await commitClient.query('COMMIT');
  } finally {
    commitClient.release();
  }

  const restartRepository = new PostgresAuditOutboxRepository();
  const published: string[] = [];
  const publisher: AuditOutboxPublisherPort = {
    publier: async (message) => { published.push(message.event.eventId); },
  };
  const delivery = new AuditOutboxDeliveryService(restartRepository, publisher);
  const deliveryResult = await delivery.traiterLot(`l2-restart-${randomUUID()}`, 100);
  assert.ok(deliveryResult.published >= 1);
  assert.ok(published.includes(eventId));

  const duplicateClient = await pool.connect();
  try {
    await duplicateClient.query('BEGIN');
    const service = new AuditCanonicalWriteService(
      new PostgresAuditCanonicalStorage(new FixedPgClient(duplicateClient)),
      new AuditCanonicalEventMapper(),
    );
    const duplicate = await service.ecrire(buildEntry(eventId, key), key);
    assert.equal(duplicate.duplicate, true);
    await duplicateClient.query('ROLLBACK');
  } finally {
    duplicateClient.release();
  }

  const destructiveClient = await pool.connect();
  try {
    await destructiveClient.query('BEGIN');
    await destructiveClient.query('SAVEPOINT append_only_update');
    await assert.rejects(
      destructiveClient.query('UPDATE audit_entries SET action=$2 WHERE id_audit_entry=$1', [eventId, 'PAIEMENT_ANNULE']),
      /Append-only violation/,
    );
    await destructiveClient.query('ROLLBACK TO SAVEPOINT append_only_update');
    await destructiveClient.query('SAVEPOINT append_only_delete');
    await assert.rejects(
      destructiveClient.query('DELETE FROM audit_entries WHERE id_audit_entry=$1', [eventId]),
      /Append-only violation/,
    );
    await destructiveClient.query('ROLLBACK TO SAVEPOINT append_only_delete');
    await destructiveClient.query('ROLLBACK');
  } finally {
    destructiveClient.release();
  }

  const concurrentEventId = `audit-l2-concurrent-${randomUUID()}`;
  const concurrentKey = `l2:concurrent:${concurrentEventId}`;
  const writer = new AuditCanonicalWriteService(
    new PostgresAuditCanonicalStorage(),
    new AuditCanonicalEventMapper(),
  );
  await writer.ecrire(buildEntry(concurrentEventId, concurrentKey), concurrentKey);
  const [claimedA, claimedB] = await Promise.all([
    restartRepository.reclamerLot(`worker-a-${randomUUID()}`, 100, 60_000),
    restartRepository.reclamerLot(`worker-b-${randomUUID()}`, 100, 60_000),
  ]);
  const claimedIds = [...claimedA, ...claimedB].map((message) => message.event.eventId);
  assert.equal(claimedIds.filter((id) => id === concurrentEventId).length, 1);

  const concurrentMessage = [...claimedA, ...claimedB]
    .find((message) => message.event.eventId === concurrentEventId);
  assert.ok(concurrentMessage);
  await pool.query(
    "UPDATE audit_outbox SET locked_at=NOW()-INTERVAL '2 minutes' WHERE id_outbox=$1",
    [concurrentMessage.idOutbox],
  );
  const recovered = await restartRepository.reclamerLot(`worker-recovery-${randomUUID()}`, 100, 60_000);
  assert.equal(recovered.filter((message) => message.event.eventId === concurrentEventId).length, 1);
});
