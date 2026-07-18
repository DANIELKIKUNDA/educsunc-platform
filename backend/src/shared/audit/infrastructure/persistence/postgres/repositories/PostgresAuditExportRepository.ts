import type { AuditExportRecord, AuditExportRepository, AuditPagination } from '../../../../domain/repositories';
import { construireExportRecord } from './audit-repository.helpers';
import { PostgresAuditDocumentStore } from './PostgresAuditDocumentStore';
import { PostgresAuditEntryRepository } from './PostgresAuditEntryRepository';

export class PostgresAuditExportRepository implements AuditExportRepository {
  public constructor(
    private readonly documents = new PostgresAuditDocumentStore(),
    private readonly entries = new PostgresAuditEntryRepository(),
  ) {}

  public async enregistrerExport(enregistrement: AuditExportRecord): Promise<void> {
    await this.documents.enregistrer('EXPORT', enregistrement.idAuditExport, enregistrement);
  }

  public async preparerExport(filtres: Record<string, unknown>, pagination?: AuditPagination): Promise<AuditExportRecord[]> {
    const lignes = await this.filtrerExports(filtres);
    const page = pagination?.page ?? 1;
    const taillePage = pagination?.taillePage ?? (lignes.length || 1);
    return lignes.slice(Math.max(0, (page - 1) * taillePage), page * taillePage);
  }

  public async preparerExportBatch(
    filtres: Record<string, unknown>,
    pagination: { curseur?: string; tailleLot: number },
  ): Promise<{ lignes: AuditExportRecord[]; curseurSuivant?: string }> {
    const lignes = await this.filtrerExports(filtres);
    const offset = pagination.curseur ? Number.parseInt(pagination.curseur, 10) || 0 : 0;
    const batch = lignes.slice(offset, offset + pagination.tailleLot);
    return {
      lignes: batch,
      curseurSuivant: offset + pagination.tailleLot < lignes.length ? String(offset + pagination.tailleLot) : undefined,
    };
  }

  public listerExports(filtres: { organisationId?: string; ecoleId?: string; acteurId?: string }): Promise<AuditExportRecord[]> {
    return this.filtrerExports(filtres);
  }

  public async expirerExports(reference: Date): Promise<number> {
    const expirables = (await this.documents.lister<AuditExportRecord>('EXPORT')).filter(
      (ligne) => ligne.dateExpiration instanceof Date && ligne.dateExpiration.getTime() <= reference.getTime(),
    );
    await Promise.all(expirables.map((ligne) => this.documents.supprimer('EXPORT', ligne.idAuditExport)));
    return expirables.length;
  }

  public async enregistrerExportDepuisAudit(idAuditEntry: string, formatExport = 'JSON'): Promise<AuditExportRecord | null> {
    const audit = await this.entries.trouverParId(idAuditEntry);
    if (!audit) return null;
    const record = construireExportRecord(audit, formatExport);
    await this.enregistrerExport(record);
    return record;
  }

  private async filtrerExports(filtres: Record<string, unknown>): Promise<AuditExportRecord[]> {
    return (await this.documents.lister<AuditExportRecord>('EXPORT')).filter((ligne) => {
      if (filtres.organisationId && ligne.organisationId !== filtres.organisationId) return false;
      if (filtres.ecoleId && ligne.ecoleId !== filtres.ecoleId) return false;
      if (filtres.acteurId && ligne.acteurId !== filtres.acteurId) return false;
      return !filtres.formatExport || ligne.formatExport === filtres.formatExport;
    });
  }
}
