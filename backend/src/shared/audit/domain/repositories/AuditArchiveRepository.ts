import type { AuditArchiveRecord } from './AuditRepositoryTypes';

// Ce repository gere l'archivage des audits arrives a maturite.
export interface AuditArchiveRepository {
  archiver(filtres: Record<string, unknown>): Promise<number>;
  enregistrerArchive(archive: AuditArchiveRecord): Promise<void>;
  rechercherArchives(filtres: Record<string, unknown>): Promise<AuditArchiveRecord[]>;
  restaurerArchives(identifiants: string[]): Promise<number>;
  preparerStockageFroid(filtres: Record<string, unknown>): Promise<number>;
}
