import type { AuditSynchronizationDeviceDto } from '../dto';

export class AuditSynchronizationDevicesInterface {
  public static creer(sortie?: Partial<AuditSynchronizationDeviceDto>): AuditSynchronizationDeviceDto {
    return {
      deviceId: sortie?.deviceId,
      appVersion: sortie?.appVersion,
      syncVersion: sortie?.syncVersion,
      lastSync: sortie?.lastSync,
      offlineDuration: sortie?.offlineDuration,
      retryHistory: sortie?.retryHistory ?? [],
    };
  }
}

