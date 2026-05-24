// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreateSynchronizationAuditInput {
  readonly action: string;
  readonly resultat: string;
  readonly replay?: boolean;
  readonly retry?: boolean;
  readonly conflit?: boolean;
  readonly contexte: Record<string, unknown>;
}
