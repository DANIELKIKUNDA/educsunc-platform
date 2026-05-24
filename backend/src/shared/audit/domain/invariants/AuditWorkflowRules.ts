// Ces regles explicitent les workflows documentaires majeurs du domaine Audit.
export class AuditWorkflowRules {
  public static readonly NAISSANCE_AUDIT = [
    'Evenement metier ou runtime',
    'MoteurConstructionAudit',
    'MoteurContextualisationAudit',
    'MoteurClassificationAudit',
    'MoteurMasquageAudit',
    'MoteurIntegriteAudit',
    'AuditEntry',
    'Repository append-only',
    'Projections analytics et alertes',
  ] as const;

  public static readonly WORKFLOW_MODIFICATION_SENSIBLE = [
    'capture ancienEtat et nouvelEtat',
    'classification pedagogique',
    'gravite moyenne ou elevee',
    'stockage tenant',
    'append-only obligatoire',
  ] as const;

  public static readonly WORKFLOW_FINANCIER_CRITIQUE = [
    'ancienEtat',
    'nouvelEtat',
    'acteur caissier ou administrateur',
    'type financier',
    'gravite elevee ou critique',
    'audit obligatoire',
  ] as const;

  public static readonly WORKFLOW_SECURITE = [
    'action acces refuse',
    'resultat refused',
    'type securite',
    'gravite selon contexte',
    'audit immediat',
  ] as const;

  public static readonly WORKFLOW_OFFLINE = [
    'audit local',
    'statut en attente de synchronisation',
    'replay eventuel',
    'synchronisation',
    'statut synchronise ou conflit',
  ] as const;
}
