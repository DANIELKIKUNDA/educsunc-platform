import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';

export class AuditTenantMonitoringService {
  public obtenirSnapshot() {
    const store = obtenirMemoireAuditStore();
    const tenants = new Map<string, number>();
    for (const entry of store.auditEntries.values()) {
      const key = `${entry.obtenirTenantAudit().obtenirOrganisationId() ?? 'NA'}|${entry.obtenirTenantAudit().obtenirEcoleId() ?? 'NA'}`;
      tenants.set(key, (tenants.get(key) ?? 0) + 1);
    }
    return {
      totalTenants: tenants.size,
      activites: [...tenants.entries()].map(([tenant, total]) => ({ tenant, total })),
    };
  }
}
