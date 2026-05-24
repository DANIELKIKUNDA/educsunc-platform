import type { AuditIdempotencyRecord } from './AuditRepositoryTypes';

// Ce repository protege l'infrastructure Audit contre les doublons de sync, replay et retry.
export interface AuditIdempotencyRepository {
  enregistrerCle(enregistrement: AuditIdempotencyRecord): Promise<void>;
  retrouverCle(cleIdempotence: string): Promise<AuditIdempotencyRecord | null>;
  estDejaTraitee(cleIdempotence: string): Promise<boolean>;
}
