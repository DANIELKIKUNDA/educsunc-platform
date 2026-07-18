import { PostgresAuditDocumentStore } from '../../persistence/postgres/repositories/PostgresAuditDocumentStore';
import { AuditRetentionForensicGuard } from '../forensic/AuditRetentionForensicGuard';
import type { AuditRetentionCandidate } from '../RetentionTypes';

// La purge est contrôlée, traçable et ne doit jamais être brutale.
export class AuditRetentionPurgeService {
  public constructor(
    private readonly forensicGuard: AuditRetentionForensicGuard = new AuditRetentionForensicGuard(),
    private readonly documents: PostgresAuditDocumentStore = new PostgresAuditDocumentStore(),
  ) {}

  public async executer(candidate: AuditRetentionCandidate): Promise<boolean> {
    if (!this.forensicGuard.peutPurger(candidate)) {
      return false;
    }
    await this.documents.enregistrer('RETENTION_PURGE_DECISION', candidate.idAuditEntry, {
      ...candidate,
      decideLe: new Date(),
    });
    return true;
  }
}
