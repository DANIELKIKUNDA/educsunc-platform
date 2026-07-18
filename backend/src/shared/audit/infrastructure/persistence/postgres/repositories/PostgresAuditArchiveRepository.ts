import type { AuditArchiveRecord, AuditArchiveRepository } from '../../../../domain/repositories';
import { construireArchiveRecord } from './audit-repository.helpers';
import { PostgresAuditDocumentStore } from './PostgresAuditDocumentStore';
import { PostgresAuditEntryRepository } from './PostgresAuditEntryRepository';

// Ce repository prepare et historise l'archivage logique sans suppression physique.
export class PostgresAuditArchiveRepository implements AuditArchiveRepository {
  public constructor(
    private readonly documents = new PostgresAuditDocumentStore(),
    private readonly entries = new PostgresAuditEntryRepository(),
  ) {}

  public async archiver(filtres: Record<string, unknown>): Promise<number> {
    const candidats = await this.entries.listerSelonFiltres(filtres);

    for (const entree of candidats) {
      const archive = construireArchiveRecord(entree, String(filtres.typeArchive ?? 'LOGIQUE'), String(filtres.raisonArchivage ?? ''));
      await this.enregistrerArchive(archive);
    }
    return candidats.length;
  }

  public async enregistrerArchive(archive: AuditArchiveRecord): Promise<void> {
    await this.documents.enregistrer('ARCHIVE', archive.idArchive, archive);
  }

  public async rechercherArchives(filtres: Record<string, unknown>): Promise<AuditArchiveRecord[]> {
    return (await this.documents.lister<AuditArchiveRecord>('ARCHIVE')).filter((archive) => {
      if (filtres.organisationId && archive.organisationId !== filtres.organisationId) { return false; }
      if (filtres.ecoleId && archive.ecoleId !== filtres.ecoleId) { return false; }
      if (filtres.typeArchive && archive.typeArchive !== filtres.typeArchive) { return false; }
      return true;
    });
  }

  public async restaurerArchives(identifiants: string[]): Promise<number> {
    let total = 0;
    for (const identifiant of identifiants) {
      if (await this.documents.supprimer('ARCHIVE', identifiant)) {
        total += 1;
      }
    }
    return total;
  }

  public async preparerStockageFroid(filtres: Record<string, unknown>): Promise<number> {
    return (await this.rechercherArchives(filtres)).length;
  }
}
