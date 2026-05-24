import { AuditForensicMonitoringService } from '../../monitoring';
import type { AuditAccessDecision } from '../SecurityTypes';

export class AuditForensicSecurityService {
  public constructor(
    private readonly monitoring: AuditForensicMonitoringService = new AuditForensicMonitoringService(),
  ) {}

  public verifier(): AuditAccessDecision {
    const snapshot = this.monitoring.obtenirSnapshot();
    return snapshot.totalLiensForensic >= 0
      ? { autorise: true, raison: 'Forensic integrity disponible.' }
      : { autorise: false, raison: 'Forensic integrity indisponible.' };
  }
}
