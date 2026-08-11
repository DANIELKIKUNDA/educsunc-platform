import type { AuditEntry } from '../../domain/aggregates';
import type { AuditCanonicalWriteResult } from '../outbox';
import type {
  AuditCanonicalEventFactoryPort,
  AuditCanonicalStoragePort,
  AuditCanonicalWritePort,
} from '../ports/outbound/AuditCanonicalWritePort';

export class AuditCanonicalWriteService implements AuditCanonicalWritePort {
  public constructor(
    private readonly storage: AuditCanonicalStoragePort,
    private readonly eventFactory: AuditCanonicalEventFactoryPort,
  ) {}

  public async ecrire(entree: AuditEntry, idempotencyKey: string): Promise<AuditCanonicalWriteResult> {
    const key = idempotencyKey.trim();
    if (key.length === 0 || key.length > 240) {
      throw new Error("La cle d'idempotence Audit est invalide.");
    }
    const event = this.eventFactory.creer(entree, key);
    return this.storage.enregistrer(entree, event);
  }
}
