import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';

export class AuditForensicMonitoringService {
  public obtenirSnapshot() {
    const store = obtenirMemoireAuditStore();
    return {
      totalLiensForensic: store.auditForensicLinks.length,
      totalPackagesColdStorage: store.auditColdStoragePackages.size,
      totalCorrelations: store.auditEntryIdsByCorrelation.size,
    };
  }
}
