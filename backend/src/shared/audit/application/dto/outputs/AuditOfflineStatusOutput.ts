// Ce DTO de sortie formalise une reponse applicative Audit.
export interface AuditOfflineStatusOutput {
  readonly total: number;
  readonly synchronises: number;
  readonly enConflit: number;
  readonly enAttente: number;
  readonly auditId?: string;
  readonly statutSynchronisation?: string;
  readonly replay?: boolean;
  readonly retry?: boolean;
  readonly conflit?: boolean;
  readonly horodatage?: string;
}
