import type { AuditRetentionCandidate } from '../RetentionTypes';

// Une retention ne doit jamais casser les corrélations nécessaires à une investigation.
export class AuditRetentionForensicGuard {
  public peutPurger(candidate: AuditRetentionCandidate): boolean {
    return candidate.lifecycleState === 'PURGE';
  }
}
