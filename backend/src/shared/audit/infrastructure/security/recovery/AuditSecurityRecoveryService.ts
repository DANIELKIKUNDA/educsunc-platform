import { AuditIntegrityService } from '../integrity/AuditIntegrityService';
import { AuditSecurityMonitoringService } from '../monitoring/AuditSecurityMonitoringService';

export class AuditSecurityRecoveryService {
  public constructor(
    private readonly integrity: AuditIntegrityService = new AuditIntegrityService(),
    private readonly monitoring: AuditSecurityMonitoringService = new AuditSecurityMonitoringService(),
  ) {}

  public snapshot() {
    return {
      integrity: this.integrity.verifier(),
      monitoring: this.monitoring.obtenirSnapshot(),
    };
  }
}
