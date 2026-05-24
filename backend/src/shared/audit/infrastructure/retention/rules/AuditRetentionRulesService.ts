import { AuditRetentionPolicyRegistry } from '../policies/AuditRetentionPolicyRegistry';
import type { AuditRetentionCandidate, AuditRetentionLifecycleState, AuditRetentionPolicy } from '../RetentionTypes';

// Les règles déterminent le cycle de vie sans suppression brutale.
export class AuditRetentionRulesService {
  public constructor(
    private readonly policies: AuditRetentionPolicyRegistry = new AuditRetentionPolicyRegistry(),
  ) {}

  public choisirPolitique(categorie: string): AuditRetentionPolicy {
    return this.policies.lister().find((policy) => policy.categorie === categorie) ?? this.policies.lister()[1];
  }

  public determinerEtat(candidate: AuditRetentionCandidate, politique: AuditRetentionPolicy, reference = new Date()): AuditRetentionLifecycleState {
    const ageJours = Math.floor((reference.getTime() - new Date(candidate.dateAction).getTime()) / (24 * 60 * 60 * 1000));
    if (ageJours < politique.dureeActiveJours) return 'ACTIVE';
    if (ageJours < politique.dureeArchiveJours) return 'ARCHIVE';
    if (politique.dureeColdStorageJours && ageJours < politique.dureeColdStorageJours) return 'COLD_STORAGE';
    return politique.purgeAutorisee ? 'PURGE' : 'COLD_STORAGE';
  }
}
