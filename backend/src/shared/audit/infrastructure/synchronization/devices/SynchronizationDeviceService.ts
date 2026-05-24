import { OfflineAuditDeviceRegistry } from '../../offline';

// La synchronisation suit chaque appareil pour eviter les chronologies melangees.
export class SynchronizationDeviceService {
  public constructor(
    private readonly registry: OfflineAuditDeviceRegistry = new OfflineAuditDeviceRegistry(),
  ) {}

  public enregistrerPresence(args: {
    deviceId: string;
    userAgent?: string;
    versionApplication?: string;
    sourceRuntime?: string;
  }): void {
    this.registry.enregistrer(args);
  }

  public marquerSynchronisation(deviceId: string, reussie: boolean): void {
    this.registry.marquerSynchronisation(deviceId, reussie);
  }
}
