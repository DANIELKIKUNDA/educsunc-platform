// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreateSensitiveConsultationAuditInput {
  readonly action: string;
  readonly resultat: string;
  readonly cible: string;
  readonly justification?: string;
  readonly contexte: Record<string, unknown>;
}
