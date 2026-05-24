import type { AuditExportRecord, AuditPagination } from './AuditRepositoryTypes';

// Ce repository prepare les extractions d'audit destinees aux exports securises.
export interface AuditExportRepository {
  enregistrerExport(enregistrement: AuditExportRecord): Promise<void>;
  preparerExport(filtres: Record<string, unknown>, pagination?: AuditPagination): Promise<AuditExportRecord[]>;
  preparerExportBatch(filtres: Record<string, unknown>, pagination: { curseur?: string; tailleLot: number }): Promise<{
    lignes: AuditExportRecord[];
    curseurSuivant?: string;
  }>;
  listerExports(filtres: { organisationId?: string; ecoleId?: string; acteurId?: string }): Promise<AuditExportRecord[]>;
  expirerExports(reference: Date): Promise<number>;
}
