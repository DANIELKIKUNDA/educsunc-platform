import { PostgresAuditOperationalReader } from '../../persistence/postgres/repositories/PostgresAuditOperationalReader';

export class AuditTenantMonitoringService {
  public constructor(private readonly reader = new PostgresAuditOperationalReader()) {}

  public async obtenirSnapshot() {
    const activites = await this.reader.activiteTenants();
    return {
      totalTenants: activites.length,
      activites,
    };
  }
}
