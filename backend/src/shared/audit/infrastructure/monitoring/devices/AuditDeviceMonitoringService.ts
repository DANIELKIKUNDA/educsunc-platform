import { OfflineAuditDeviceRegistry } from '../../offline';

export class AuditDeviceMonitoringService {
  public constructor(
    private readonly devices: OfflineAuditDeviceRegistry = new OfflineAuditDeviceRegistry(),
  ) {}

  public obtenirSnapshot() {
    const entries = this.devices.lister();
    return {
      totalDevices: entries.length,
      versions: [...new Set(entries.map((entry) => entry.versionApplication).filter(Boolean))],
      offlinePotentiels: entries.filter((entry) => !entry.derniereSynchronisationLe).length,
    };
  }
}
