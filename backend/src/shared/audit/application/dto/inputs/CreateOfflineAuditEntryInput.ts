// Ce DTO d'entree formalise un contrat applicatif Audit.
export interface CreateOfflineAuditEntryInput {
  readonly audit: Record<string, unknown>;
  readonly dateLocaleAction?: string;
  readonly dateSynchronisation?: string;
  readonly appareil?: string;
  readonly statutSynchronisation: string;
  readonly replay?: boolean;
  readonly retry?: boolean;
  readonly conflit?: boolean;
}
