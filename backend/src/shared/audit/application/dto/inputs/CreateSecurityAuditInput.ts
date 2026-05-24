// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreateSecurityAuditInput {
  readonly action: string;
  readonly resultat: string;
  readonly gravite?: string;
  readonly permissionsActives?: readonly string[];
  readonly scopesActifs?: readonly string[];
  readonly contexte: Record<string, unknown>;
}
