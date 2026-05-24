import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';
import { AuditRetentionForensicGuard } from '../forensic/AuditRetentionForensicGuard';
import type { AuditRetentionCandidate } from '../RetentionTypes';

// La purge est contrôlée, traçable et ne doit jamais être brutale.
export class AuditRetentionPurgeService {
  public constructor(
    private readonly forensicGuard: AuditRetentionForensicGuard = new AuditRetentionForensicGuard(),
  ) {}

  public executer(candidate: AuditRetentionCandidate): boolean {
    if (!this.forensicGuard.peutPurger(candidate)) {
      return false;
    }
    return obtenirMemoireAuditStore().auditEntries.delete(candidate.idAuditEntry);
  }
}
