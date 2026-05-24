import type { AuditExportQuery } from '../queries/AuditExportQuery';

// Cette commande formalise une demande d'export audit au niveau applicatif.
export interface ExportAuditCommand extends AuditExportQuery {
  readonly demandePar?: string;
  readonly inclureDonneesSensibles?: boolean;
}
