import type { AuditEntry } from '../../../domain/aggregates';
import type {
  AuditCanonicalEvent,
  AuditCanonicalWriteResult,
  AuditOutboxMessage,
} from '../../outbox';

export interface AuditCanonicalStoragePort {
  enregistrer(entree: AuditEntry, event: AuditCanonicalEvent): Promise<AuditCanonicalWriteResult>;
}

export interface AuditCanonicalEventFactoryPort {
  creer(entree: AuditEntry, idempotencyKey: string): AuditCanonicalEvent;
}

export interface AuditCanonicalWritePort {
  ecrire(entree: AuditEntry, idempotencyKey: string): Promise<AuditCanonicalWriteResult>;
}

export interface AuditOutboxRepositoryPort {
  ajouter(event: AuditCanonicalEvent): Promise<AuditCanonicalWriteResult>;
  reclamerLot(workerId: string, limit: number, lockTimeoutMs: number): Promise<AuditOutboxMessage[]>;
  marquerPublie(idOutbox: string, workerId: string): Promise<void>;
  marquerEchec(
    idOutbox: string,
    workerId: string,
    errorMessage: string,
    nextAttemptAt: Date,
    terminal: boolean,
  ): Promise<void>;
}

export interface AuditOutboxPublisherPort {
  publier(message: AuditOutboxMessage): Promise<void>;
}
