import { AuditIntegrityService } from '../integrity/AuditIntegrityService';
import { AuditSecurityMonitoringService } from '../monitoring/AuditSecurityMonitoringService';

export class AuditSecurityRecoveryService {
  public constructor(
    private readonly integrity: AuditIntegrityService = new AuditIntegrityService(),
    private readonly monitoring: AuditSecurityMonitoringService = new AuditSecurityMonitoringService(),
  ) {}

  public async snapshot() {
    return {
      integrity: await this.integrity.verifier(),
      monitoring: await this.monitoring.obtenirSnapshot(),
    };
  }
}
