// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreateSystemAuditInput {
  readonly action: string;
  readonly resultat: string;
  readonly sourceSysteme: string;
  readonly message?: string;
  readonly contexte: Record<string, unknown>;
}
