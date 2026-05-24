import type { AuditRetentionPolicy } from '../RetentionTypes';

// La retention est differenciée selon la nature et la valeur des données.
export class AuditRetentionPolicyRegistry {
  public lister(): readonly AuditRetentionPolicy[] {
    return [
      {
        code: 'AUDIT_SECURITE_LONGUE',
        categorie: 'SECURITE',
        dureeActiveJours: 365,
        dureeArchiveJours: 365 * 3,
        dureeColdStorageJours: 365 * 7,
        purgeAutorisee: false,
      },
      {
        code: 'AUDIT_TECHNIQUE_COURTE',
        categorie: 'TECHNIQUE',
        dureeActiveJours: 30,
        dureeArchiveJours: 180,
        dureeColdStorageJours: 365,
        purgeAutorisee: true,
      },
      {
        code: 'EXPORT_FORENSIC_REGLEMENTAIRE',
        categorie: 'EXPORT_FORENSIC',
        dureeActiveJours: 90,
        dureeArchiveJours: 365,
        dureeColdStorageJours: 365 * 5,
        purgeAutorisee: false,
      },
    ];
  }
}
