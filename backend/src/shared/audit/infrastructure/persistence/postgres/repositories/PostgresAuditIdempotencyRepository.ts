import type { AuditIdempotencyRecord, AuditIdempotencyRepository } from '../../../../domain/repositories';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository protege l'ecriture audit contre les doublons de sync et de workers.
export class PostgresAuditIdempotencyRepository implements AuditIdempotencyRepository {
  public async enregistrerCle(enregistrement: AuditIdempotencyRecord): Promise<void> {
    obtenirMemoireAuditStore().auditIdempotency.set(enregistrement.cleIdempotence, enregistrement);
  }

  public async retrouverCle(cleIdempotence: string): Promise<AuditIdempotencyRecord | null> {
    return obtenirMemoireAuditStore().auditIdempotency.get(cleIdempotence) ?? null;
  }

  public async estDejaTraitee(cleIdempotence: string): Promise<boolean> {
    return obtenirMemoireAuditStore().auditIdempotency.has(cleIdempotence);
  }
}
