import { AuditExportTrackingService } from '../tracking/AuditExportTrackingService';
import type { AuditExportMonitoringSnapshot } from '../ExportInfrastructureTypes';

// Le monitoring export suit volumétrie, échecs, expirations, téléchargements et exports massifs.
export class AuditExportMonitoringService {
  public constructor(
    private readonly tracking: AuditExportTrackingService = new AuditExportTrackingService(),
  ) {}

  public obtenirSnapshot(): AuditExportMonitoringSnapshot {
    const entries = this.tracking.lister();
    return {
      totalExports: entries.length,
      totalExpires: entries.filter((entry) => entry.statut === 'EXPIRE').length,
      totalFailures: entries.filter((entry) => entry.statut === 'ECHEC').length,
      totalForensic: entries.filter((entry) => entry.forensic).length,
      totalMassifs: entries.filter((entry) => entry.nombreElements >= 1000).length,
      totalDownloads: entries.filter((entry) => entry.statut === 'TELECHARGE').length,
    };
  }
}
