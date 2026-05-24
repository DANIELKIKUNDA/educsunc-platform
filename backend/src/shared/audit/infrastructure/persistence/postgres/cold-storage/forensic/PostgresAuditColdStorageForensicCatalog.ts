import type { AuditColdStorageSearchFilters } from '../AuditColdStorageTypes';
import { PostgresAuditColdStorageReader } from '../readers/PostgresAuditColdStorageReader';

// Ce catalogue garde les indices forensic exploitables meme pour des donnees tres anciennes.
export class PostgresAuditColdStorageForensicCatalog {
  constructor(private readonly reader: PostgresAuditColdStorageReader) {}

  public async listerIndices(filtres: AuditColdStorageSearchFilters) {
    const paquets = await this.reader.rechercher(filtres);
    return paquets.map((paquet) => ({
      packageId: paquet.packageId,
      correlationIds: paquet.forensic.correlationIds,
      requestIds: paquet.forensic.requestIds,
      deviceIds: paquet.forensic.deviceIds,
      acteurIds: paquet.forensic.acteurIds,
      ressourcesIds: paquet.forensic.ressourcesIds,
      chronologie: paquet.chronologie,
    }));
  }
}

