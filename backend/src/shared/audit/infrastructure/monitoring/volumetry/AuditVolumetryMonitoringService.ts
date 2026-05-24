import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';

export class AuditVolumetryMonitoringService {
  public obtenirSnapshot() {
    const store = obtenirMemoireAuditStore();
    return {
      auditEntries: store.auditEntries.size,
      exports: store.auditExports.size,
      projections: store.auditProjections.size,
      archives: store.auditArchives.size,
      coldStoragePackages: store.auditColdStoragePackages.size,
    };
  }
}
