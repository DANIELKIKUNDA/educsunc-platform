// Ce fichier centralise les invariants transverses non negociables du domaine Audit.
export class AuditInvariants {
  public static readonly APPEND_ONLY = 'Un audit est append-only.';
  public static readonly IMMUTABLE = 'Un audit cree est immuable.';
  public static readonly PAS_DE_SUPPRESSION_PHYSIQUE = 'Aucun audit ne peut etre supprime physiquement.';
  public static readonly ACTION_OBLIGATOIRE = 'Tout audit doit avoir une action explicite.';
  public static readonly RESULTAT_OBLIGATOIRE = 'Tout audit doit avoir un resultat.';
  public static readonly DATE_ACTION_OBLIGATOIRE = 'Tout audit doit avoir une dateAction.';
  public static readonly DATE_CREATION_OBLIGATOIRE = 'Tout audit doit avoir une dateCreationAudit.';
  public static readonly TENANT_COHERENT = 'Tout audit doit avoir un tenant coherent.';
  public static readonly ACTION_HUMAINE_AVEC_UTILISATEUR = 'Toute action humaine doit avoir un acteur utilisateur.';
  public static readonly HTTP_AVEC_REQUEST_ID = 'Toute action HTTP doit avoir un requestId.';
  public static readonly OPERATION_COMPLEXE_AVEC_CORRELATION = 'Toute operation complexe doit avoir un correlationId.';
  public static readonly OFFLINE_AVEC_METADONNEES = 'Toute action offline doit avoir ses metadonnees offline.';
  public static readonly SNAPSHOTS_SANS_SECRETS = 'Les snapshots ne doivent jamais contenir de secrets.';
  public static readonly PERMISSIONS_HISTORIQUES = 'Les permissions historiques doivent etre conservees.';
  public static readonly LECTURE_AVEC_SECURITY = 'Les lectures audit doivent toujours respecter SECURITY.';
  public static readonly EXPORT_AUDITE = 'Les exports audit doivent toujours etre audites.';
  public static readonly ECOLE_ISOLEE = 'Une ecole ne voit jamais les audits d une autre ecole.';
  public static readonly ORGANISATION_ISOLEE = 'Une organisation ne voit jamais les audits d une autre organisation.';
  public static readonly RETENTION_CRITIQUE = 'Les audits critiques doivent etre conserves plus longtemps.';
  public static readonly FORENSIC_EXPLOITABLE = 'Les audits doivent rester exploitables pour forensic.';

  public static toutesLesRegles(): readonly string[] {
    return [
      AuditInvariants.APPEND_ONLY,
      AuditInvariants.IMMUTABLE,
      AuditInvariants.PAS_DE_SUPPRESSION_PHYSIQUE,
      AuditInvariants.ACTION_OBLIGATOIRE,
      AuditInvariants.RESULTAT_OBLIGATOIRE,
      AuditInvariants.DATE_ACTION_OBLIGATOIRE,
      AuditInvariants.DATE_CREATION_OBLIGATOIRE,
      AuditInvariants.TENANT_COHERENT,
      AuditInvariants.ACTION_HUMAINE_AVEC_UTILISATEUR,
      AuditInvariants.HTTP_AVEC_REQUEST_ID,
      AuditInvariants.OPERATION_COMPLEXE_AVEC_CORRELATION,
      AuditInvariants.OFFLINE_AVEC_METADONNEES,
      AuditInvariants.SNAPSHOTS_SANS_SECRETS,
      AuditInvariants.PERMISSIONS_HISTORIQUES,
      AuditInvariants.LECTURE_AVEC_SECURITY,
      AuditInvariants.EXPORT_AUDITE,
      AuditInvariants.ECOLE_ISOLEE,
      AuditInvariants.ORGANISATION_ISOLEE,
      AuditInvariants.RETENTION_CRITIQUE,
      AuditInvariants.FORENSIC_EXPLOITABLE,
    ];
  }
}
