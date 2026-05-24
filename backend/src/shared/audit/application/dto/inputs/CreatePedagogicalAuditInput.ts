// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreatePedagogicalAuditInput {
  readonly action: string;
  readonly resultat: string;
  readonly ancienEtat?: unknown;
  readonly nouvelEtat?: unknown;
  readonly classeId?: string;
  readonly coursId?: string;
  readonly contexte: Record<string, unknown>;
}
