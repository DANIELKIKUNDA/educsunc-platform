// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreateAuditEntryInput {
  readonly action: string;
  readonly typePrincipal: string;
  readonly categories?: readonly string[];
  readonly gravite?: string;
  readonly niveau?: string;
  readonly resultat: string;
  readonly acteur: {
    readonly idUtilisateur?: string;
    readonly typeActeur: string;
    readonly roleActif?: string;
  };
  readonly ressource?: {
    readonly typeRessource: string;
    readonly idRessource?: string;
    readonly libelle?: string;
  };
  readonly ancienEtat?: unknown;
  readonly nouvelEtat?: unknown;
  readonly contexte: {
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly sessionId?: string;
    readonly adresseIp?: string;
    readonly userAgent?: string;
    readonly deviceId?: string;
    readonly sourceAudit: string;
    readonly modeOffline: boolean;
  };
  readonly tenant: {
    readonly organisationId?: string;
    readonly ecoleId?: string;
    readonly scope: string;
  };
  readonly metadata?: Record<string, unknown>;
}
