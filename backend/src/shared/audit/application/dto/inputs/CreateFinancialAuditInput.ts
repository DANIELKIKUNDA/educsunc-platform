// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreateFinancialAuditInput {
  readonly action: string;
  readonly resultat: string;
  readonly montant?: number;
  readonly devise?: string;
  readonly ancienEtat?: unknown;
  readonly nouvelEtat?: unknown;
  readonly contexte: Record<string, unknown>;
}
