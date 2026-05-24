import type { AuditColdStorageMonitoringReadModel } from '../AuditColdStorageTypes';
import { obtenirMemoireAuditStore } from '../../repositories/_memoireAuditStore';

// Ce monitoring suit la volumetrie et la croissance du stockage froid.
export class PostgresAuditColdStorageMonitoringService {
  public async lireEtat(): Promise<AuditColdStorageMonitoringReadModel> {
    const paquets = [...obtenirMemoireAuditStore().auditColdStoragePackages.values()];
    return {
      totalPackages: paquets.length,
      totalArchives: paquets.reduce((total, paquet) => total + paquet.totalArchives, 0),
      totalAudits: paquets.reduce((total, paquet) => total + paquet.totalAudits, 0),
      dernierPackageCreeLe: paquets.map((paquet) => paquet.creeLe).sort().at(-1),
    };
  }
}

