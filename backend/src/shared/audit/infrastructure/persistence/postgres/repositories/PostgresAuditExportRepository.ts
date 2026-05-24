import type { AuditExportRecord, AuditExportRepository, AuditPagination } from '../../../../domain/repositories';
import { construireExportRecord } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository gere les traces d'exports et leur consultation paginee.
export class PostgresAuditExportRepository implements AuditExportRepository {
  public async enregistrerExport(enregistrement: AuditExportRecord): Promise<void> {
    obtenirMemoireAuditStore().auditExports.set(enregistrement.idAuditExport, enregistrement);
  }

  public async preparerExport(filtres: Record<string, unknown>, pagination?: AuditPagination): Promise<AuditExportRecord[]> {
    const lignes = this.filtrerExports(filtres);
    const page = pagination?.page ?? 1;
    const taillePage = pagination?.taillePage ?? (lignes.length || 1);
    const offset = Math.max(0, (page - 1) * taillePage);
    return lignes.slice(offset, offset + taillePage);
  }

  public async preparerExportBatch(
    filtres: Record<string, unknown>,
    pagination: { curseur?: string; tailleLot: number },
  ): Promise<{ lignes: AuditExportRecord[]; curseurSuivant?: string }> {
    const lignes = this.filtrerExports(filtres);
    const offset = pagination.curseur ? Number.parseInt(pagination.curseur, 10) || 0 : 0;
    const batch = lignes.slice(offset, offset + pagination.tailleLot);
    return {
      lignes: batch,
      curseurSuivant: offset + pagination.tailleLot < lignes.length ? String(offset + pagination.tailleLot) : undefined,
    };
  }

  public async listerExports(filtres: { organisationId?: string; ecoleId?: string; acteurId?: string }): Promise<AuditExportRecord[]> {
    return this.filtrerExports(filtres);
  }

  public async expirerExports(reference: Date): Promise<number> {
    const store = obtenirMemoireAuditStore();
    const expirables = [...store.auditExports.values()].filter(
      (ligne) => ligne.dateExpiration instanceof Date && ligne.dateExpiration.getTime() <= reference.getTime(),
    );
    for (const ligne of expirables) {
      store.auditExports.delete(ligne.idAuditExport);
    }
    return expirables.length;
  }

  // Cette aide permet d'alimenter rapidement l'historique export depuis une entree source.
  public async enregistrerExportDepuisAudit(idAuditEntry: string, formatExport = 'JSON'): Promise<AuditExportRecord | null> {
    const audit = obtenirMemoireAuditStore().auditEntries.get(idAuditEntry);
    if (!audit) {
      return null;
    }
    const record = construireExportRecord(audit, formatExport);
    await this.enregistrerExport(record);
    return record;
  }

  private filtrerExports(filtres: Record<string, unknown>): AuditExportRecord[] {
    return [...obtenirMemoireAuditStore().auditExports.values()].filter((ligne) => {
      if (filtres.organisationId && ligne.organisationId !== filtres.organisationId) { return false; }
      if (filtres.ecoleId && ligne.ecoleId !== filtres.ecoleId) { return false; }
      if (filtres.acteurId && ligne.acteurId !== filtres.acteurId) { return false; }
      if (filtres.formatExport && ligne.formatExport !== filtres.formatExport) { return false; }
      return true;
    });
  }
}
