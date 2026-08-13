// Ce DTO de sortie formalise une reponse applicative Audit.
export interface AuditExportOutput {
  readonly exportId: string;
  readonly format: string;
  readonly nombreElements: number;
  readonly dateGeneration: string;
  readonly statut?: string;
  readonly urlTemporaire?: string;
}
