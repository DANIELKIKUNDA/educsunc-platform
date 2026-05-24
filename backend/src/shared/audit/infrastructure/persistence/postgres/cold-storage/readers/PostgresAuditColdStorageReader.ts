import { obtenirMemoireAuditStore } from '../../repositories/_memoireAuditStore';
import type { AuditColdStoragePackage, AuditColdStorageSearchFilters } from '../AuditColdStorageTypes';

// Ce lecteur maintient la separation entre stockage actif et stockage froid non temps reel.
export class PostgresAuditColdStorageReader {
  public async rechercher(filtres: AuditColdStorageSearchFilters): Promise<AuditColdStoragePackage[]> {
    return [...obtenirMemoireAuditStore().auditColdStoragePackages.values()].filter((paquet) => {
      if (filtres.packageId && paquet.packageId !== filtres.packageId) { return false; }
      if (filtres.organisationId && paquet.organisationId !== filtres.organisationId) { return false; }
      if (filtres.ecoleId && paquet.ecoleId !== filtres.ecoleId) { return false; }
      if (filtres.typeArchive && paquet.typeArchive !== filtres.typeArchive) { return false; }
      return true;
    });
  }

  public async lireUnitaire(packageId: string): Promise<AuditColdStoragePackage | null> {
    return obtenirMemoireAuditStore().auditColdStoragePackages.get(packageId) ?? null;
  }
}

