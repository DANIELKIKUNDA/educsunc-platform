import type { AuditColdStorageMonitoringReadModel } from '../AuditColdStorageTypes';
import type { AuditColdStoragePackage } from '../AuditColdStorageTypes';
import { PostgresAuditDocumentStore } from '../../repositories/PostgresAuditDocumentStore';

// Ce monitoring suit la volumetrie et la croissance du stockage froid.
export class PostgresAuditColdStorageMonitoringService {
  public constructor(private readonly documents = new PostgresAuditDocumentStore()) {}

  public async lireEtat(): Promise<AuditColdStorageMonitoringReadModel> {
    const paquets = await this.documents.lister<AuditColdStoragePackage>('COLD_STORAGE');
    return {
      totalPackages: paquets.length,
      totalArchives: paquets.reduce((total, paquet) => total + paquet.totalArchives, 0),
      totalAudits: paquets.reduce((total, paquet) => total + paquet.totalAudits, 0),
      dernierPackageCreeLe: paquets.map((paquet) => paquet.creeLe).sort().at(-1),
    };
  }
}
