// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreateExportAuditInput {
  readonly action: string;
  readonly formatExport: string;
  readonly nombreLignes?: number;
  readonly resultat: string;
  readonly contexte: Record<string, unknown>;
}
