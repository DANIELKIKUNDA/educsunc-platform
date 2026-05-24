// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface AuditOfflineQuery {
  readonly statutSynchronisation?: string;
  readonly replay?: boolean;
  readonly retry?: boolean;
  readonly conflit?: boolean;
}
