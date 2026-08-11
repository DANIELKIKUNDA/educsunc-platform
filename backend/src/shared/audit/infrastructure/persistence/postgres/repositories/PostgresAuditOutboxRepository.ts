import { randomUUID } from 'node:crypto';
import type {
  AuditCanonicalEvent,
  AuditCanonicalWriteResult,
  AuditOutboxMessage,
  AuditOutboxStatus,
} from '../../../../application/outbox';
import type { AuditOutboxRepositoryPort } from '../../../../application/ports/outbound';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

type AuditOutboxRow = {
  id_outbox: string;
  event_id: string;
  idempotency_key: string;
  payload: AuditCanonicalEvent | string;
  status: AuditOutboxStatus;
  attempt_count: number;
  next_attempt_at: string | Date;
  locked_at: string | Date | null;
  locked_by: string | null;
  last_error: string | null;
  created_at: string | Date;
  published_at: string | Date | null;
};

const SENSITIVE_FIELDS = /password|mot.?de.?passe|token|jwt|cookie|secret|hash|authorization/i;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE_FIELDS.test(key))
      .map(([key, content]) => [key, sanitize(content)]));
  }
  return value;
}

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export class PostgresAuditOutboxRepository implements AuditOutboxRepositoryPort {
  public constructor(private readonly client: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async ajouter(event: AuditCanonicalEvent): Promise<AuditCanonicalWriteResult> {
    const idOutbox = randomUUID();
    const result = await this.client.executer<{ id_outbox: string }>(
      `INSERT INTO audit_outbox (
         id_outbox,event_id,event_name,schema_version,idempotency_key,payload,
         organisation_id,ecole_id,scope,request_id,correlation_id,status,next_attempt_at
       ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,'PENDING',NOW())
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING id_outbox`,
      [
        idOutbox,
        event.eventId,
        event.eventType,
        event.schemaVersion,
        event.idempotencyKey,
        JSON.stringify(sanitize(event)),
        event.tenant.organisationId ?? null,
        event.tenant.ecoleId ?? null,
        event.tenant.scope,
        event.requestId ?? null,
        event.correlationId ?? null,
      ],
    );
    if (result.nombreLignesAffectees > 0) {
      return { eventId: event.eventId, idOutbox, duplicate: false };
    }

    const existing = await this.client.executer<Pick<AuditOutboxRow, 'id_outbox' | 'event_id'>>(
      'SELECT id_outbox,event_id FROM audit_outbox WHERE idempotency_key=$1',
      [event.idempotencyKey],
    );
    const row = existing.lignes[0];
    if (!row || row.event_id !== event.eventId) {
      throw new Error("La cle d'idempotence Audit est deja associee a un autre evenement.");
    }
    return { eventId: row.event_id, idOutbox: row.id_outbox, duplicate: true };
  }

  public async reclamerLot(workerId: string, limit: number, lockTimeoutMs: number): Promise<AuditOutboxMessage[]> {
    const result = await this.client.executer<AuditOutboxRow>(
      `WITH candidates AS (
         SELECT id_outbox
         FROM audit_outbox
         WHERE (
           status IN ('PENDING','RETRY') AND next_attempt_at <= NOW()
         ) OR (
           status='PROCESSING' AND locked_at < NOW() - ($3::bigint * INTERVAL '1 millisecond')
         )
         ORDER BY created_at,id_outbox
         FOR UPDATE SKIP LOCKED
         LIMIT $2
       )
       UPDATE audit_outbox AS outbox
       SET status='PROCESSING',locked_at=NOW(),locked_by=$1
       FROM candidates
       WHERE outbox.id_outbox=candidates.id_outbox
       RETURNING outbox.*`,
      [workerId, Math.max(1, Math.min(limit, 100)), Math.max(lockTimeoutMs, 1_000)],
    );
    return result.lignes.map((row) => this.toMessage(row));
  }

  public async marquerPublie(idOutbox: string, workerId: string): Promise<void> {
    const result = await this.client.executer(
      `UPDATE audit_outbox
       SET status='PUBLISHED',published_at=NOW(),locked_at=NULL,locked_by=NULL,last_error=NULL
       WHERE id_outbox=$1 AND status='PROCESSING' AND locked_by=$2`,
      [idOutbox, workerId],
    );
    if (result.nombreLignesAffectees !== 1) {
      throw new Error("Le verrou du message Audit n'est plus detenu par ce worker.");
    }
  }

  public async marquerEchec(
    idOutbox: string,
    workerId: string,
    errorMessage: string,
    nextAttemptAt: Date,
    terminal: boolean,
  ): Promise<void> {
    const result = await this.client.executer(
      `UPDATE audit_outbox
       SET status=$3,attempt_count=attempt_count+1,next_attempt_at=$4,
           last_error=$5,locked_at=NULL,locked_by=NULL
       WHERE id_outbox=$1 AND status='PROCESSING' AND locked_by=$2`,
      [idOutbox, workerId, terminal ? 'DEAD' : 'RETRY', nextAttemptAt.toISOString(), errorMessage.slice(0, 1_000)],
    );
    if (result.nombreLignesAffectees !== 1) {
      throw new Error("Le verrou du message Audit n'est plus detenu par ce worker.");
    }
  }

  private toMessage(row: AuditOutboxRow): AuditOutboxMessage {
    const event = typeof row.payload === 'string' ? JSON.parse(row.payload) as AuditCanonicalEvent : row.payload;
    return {
      idOutbox: row.id_outbox,
      event,
      status: row.status,
      attemptCount: row.attempt_count,
      nextAttemptAt: toIso(row.next_attempt_at),
      lockedAt: row.locked_at ? toIso(row.locked_at) : undefined,
      lockedBy: row.locked_by ?? undefined,
      lastError: row.last_error ?? undefined,
      createdAt: toIso(row.created_at),
      publishedAt: row.published_at ? toIso(row.published_at) : undefined,
    };
  }
}
