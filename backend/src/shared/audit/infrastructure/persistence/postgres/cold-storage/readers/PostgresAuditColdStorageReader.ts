import { PostgresAuditDocumentStore } from '../../repositories/PostgresAuditDocumentStore';
import type { AuditColdStoragePackage, AuditColdStorageSearchFilters } from '../AuditColdStorageTypes';

// Ce lecteur maintient la separation entre stockage actif et stockage froid non temps reel.
export class PostgresAuditColdStorageReader {
  public constructor(private readonly documents = new PostgresAuditDocumentStore()) {}

  public async rechercher(filtres: AuditColdStorageSearchFilters): Promise<AuditColdStoragePackage[]> {
    return (await this.documents.lister<AuditColdStoragePackage>('COLD_STORAGE')).filter((paquet) => {
      if (filtres.packageId && paquet.packageId !== filtres.packageId) { return false; }
      if (filtres.organisationId && paquet.organisationId !== filtres.organisationId) { return false; }
      if (filtres.ecoleId && paquet.ecoleId !== filtres.ecoleId) { return false; }
      if (filtres.typeArchive && paquet.typeArchive !== filtres.typeArchive) { return false; }
      return true;
    });
  }

  public async lireUnitaire(packageId: string): Promise<AuditColdStoragePackage | null> {
    return this.documents.obtenir('COLD_STORAGE', packageId);
  }
}
