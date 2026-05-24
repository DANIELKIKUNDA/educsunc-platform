// Ce DTO de sortie formalise une reponse applicative Audit.
export interface AuditEntryOutput {
  readonly idAuditEntry: string;
  readonly action: string;
  readonly typePrincipal: string;
  readonly typeAuditPrincipal: string;
  readonly categories: readonly string[];
  readonly gravite: string;
  readonly resultat: string;
  readonly acteur: {
    readonly idUtilisateur?: string;
    readonly typeActeur?: string;
    readonly roleActif?: string;
  };
  readonly ressource?: {
    readonly typeRessource?: string;
    readonly idRessource?: string;
    readonly libelle?: string;
  };
  readonly tenant: {
    readonly organisationId?: string;
    readonly ecoleId?: string;
    readonly scope?: string;
  };
  readonly contexte: {
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly sessionId?: string;
    readonly sourceAudit: string;
    readonly modeOffline: boolean;
  };
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string;
  readonly dateAction: string;
}
