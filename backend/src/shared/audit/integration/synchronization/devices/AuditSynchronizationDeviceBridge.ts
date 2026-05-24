import type { AuditContext } from '../../../context';
import { SynchronizationDeviceService } from '../../../infrastructure/synchronization';
import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';

export class AuditSynchronizationDeviceBridge {
  public constructor(
    private readonly devices: SynchronizationDeviceService = new SynchronizationDeviceService(),
  ) {}

  public enregistrerDepuisContexte(auditContext?: AuditContext): void {
    const deviceId = auditContext?.device.deviceId;
    if (!deviceId) {
      return;
    }

    this.devices.enregistrerPresence({
      deviceId,
      userAgent: auditContext.userAgent,
      versionApplication: auditContext.device.appVersion,
      sourceRuntime: auditContext.runtime.runtime,
    });
  }

  public enregistrerDepuisItem(item: OfflineAuditQueueItem): void {
    this.devices.enregistrerPresence({
      deviceId: item.deviceId ?? 'unknown-device',
      sourceRuntime: item.sourceRuntime,
    });
  }
}
