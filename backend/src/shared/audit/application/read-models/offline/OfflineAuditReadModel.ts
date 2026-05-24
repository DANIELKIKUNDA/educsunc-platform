// Ce read-model optimise une lecture applicative du BC Audit.
export interface OfflineAuditReadModel {
  readonly auditId: string;
  readonly statutSynchronisation: string;
  readonly replay?: boolean;
  readonly retry?: boolean;
  readonly conflit?: boolean;
}
