import { AuditAlertService } from '../alerts/AuditAlertService';
import { AuditVolumetryMonitoringService } from '../volumetry/AuditVolumetryMonitoringService';

export class AuditAnomalyDetectionService {
  public constructor(
    private readonly alerts: AuditAlertService = new AuditAlertService(),
    private readonly volumetry: AuditVolumetryMonitoringService = new AuditVolumetryMonitoringService(),
  ) {}

  public detecter() {
    const anomalies = this.alerts.detecter().map((alert) => ({
      code: alert.code,
      message: alert.message,
      severite: alert.severite,
    }));
    const volume = this.volumetry.obtenirSnapshot();
    if (volume.auditEntries > 100_000) {
      anomalies.push({
        code: 'AUDIT_VOLUMETRY_SPIKE',
        message: 'La volumétrie audit dépasse le seuil de surveillance V1.',
        severite: 'AVERTISSEMENT' as const,
      });
    }
    return anomalies;
  }
}
