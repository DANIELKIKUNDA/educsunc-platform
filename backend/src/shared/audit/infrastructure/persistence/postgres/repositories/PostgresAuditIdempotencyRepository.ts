import type { AuditIdempotencyRecord, AuditIdempotencyRepository } from '../../../../domain/repositories';
import { PostgresAuditDocumentStore } from './PostgresAuditDocumentStore';

// Ce repository protege l'ecriture audit contre les doublons de sync et de workers.
export class PostgresAuditIdempotencyRepository implements AuditIdempotencyRepository {
  public constructor(private readonly documents = new PostgresAuditDocumentStore()) {}
  public async enregistrerCle(enregistrement: AuditIdempotencyRecord): Promise<void> {
    await this.documents.enregistrer('IDEMPOTENCY', enregistrement.cleIdempotence, enregistrement);
  }

  public async retrouverCle(cleIdempotence: string): Promise<AuditIdempotencyRecord | null> {
    return this.documents.obtenir('IDEMPOTENCY', cleIdempotence);
  }

  public async estDejaTraitee(cleIdempotence: string): Promise<boolean> {
    return (await this.documents.obtenir('IDEMPOTENCY', cleIdempotence)) !== null;
  }
}
