// Ces regles expriment la posture d archivage du domaine Audit.
export class AuditArchivingRules {
  public static readonly ARCHIVAGE_SANS_REECRITURE = 'L archivage ne reecrit jamais l entree d origine.';
  public static readonly ARCHIVAGE_RESPECTE_RETENTION = 'L archivage respecte la retention officielle.';
  public static readonly ARCHIVAGE_PRESERVE_FORENSIC = 'L archivage preserve l exploitabilite forensic.';
}
