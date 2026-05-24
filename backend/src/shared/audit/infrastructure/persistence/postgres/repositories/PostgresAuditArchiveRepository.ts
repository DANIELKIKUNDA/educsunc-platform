import type { AuditArchiveRecord, AuditArchiveRepository } from '../../../../domain/repositories';
import { construireArchiveRecord } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository prepare et historise l'archivage logique sans suppression physique.
export class PostgresAuditArchiveRepository implements AuditArchiveRepository {
  public async archiver(filtres: Record<string, unknown>): Promise<number> {
    const store = obtenirMemoireAuditStore();
    const candidats = [...store.auditEntries.values()].filter((entree) => {
      const tenant = entree.obtenirTenantAudit();
      if (filtres.organisationId && tenant.obtenirOrganisationId() !== filtres.organisationId) { return false; }
      if (filtres.ecoleId && tenant.obtenirEcoleId() !== filtres.ecoleId) { return false; }
      return true;
    });

    for (const entree of candidats) {
      const archive = construireArchiveRecord(entree, String(filtres.typeArchive ?? 'LOGIQUE'), String(filtres.raisonArchivage ?? ''));
      store.auditArchives.set(archive.idArchive, archive);
    }
    return candidats.length;
  }

  public async enregistrerArchive(archive: AuditArchiveRecord): Promise<void> {
    obtenirMemoireAuditStore().auditArchives.set(archive.idArchive, archive);
  }

  public async rechercherArchives(filtres: Record<string, unknown>): Promise<AuditArchiveRecord[]> {
    return [...obtenirMemoireAuditStore().auditArchives.values()].filter((archive) => {
      if (filtres.organisationId && archive.organisationId !== filtres.organisationId) { return false; }
      if (filtres.ecoleId && archive.ecoleId !== filtres.ecoleId) { return false; }
      if (filtres.typeArchive && archive.typeArchive !== filtres.typeArchive) { return false; }
      return true;
    });
  }

  public async restaurerArchives(identifiants: string[]): Promise<number> {
    const store = obtenirMemoireAuditStore();
    let total = 0;
    for (const identifiant of identifiants) {
      if (store.auditArchives.delete(identifiant)) {
        total += 1;
      }
    }
    return total;
  }

  public async preparerStockageFroid(filtres: Record<string, unknown>): Promise<number> {
    return (await this.rechercherArchives(filtres)).length;
  }
}
