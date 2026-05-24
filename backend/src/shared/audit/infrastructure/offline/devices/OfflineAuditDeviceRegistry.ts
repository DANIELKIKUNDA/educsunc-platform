import { obtenirOfflineAuditLocalStore } from '../storage/OfflineAuditLocalStore';
import type { OfflineAuditDeviceState } from '../OfflineAuditTypes';

// Chaque appareil garde sa propre chronologie offline et son suivi de synchronisation.
export class OfflineAuditDeviceRegistry {
  public enregistrer(args: {
    deviceId: string;
    userAgent?: string;
    versionApplication?: string;
    sourceRuntime?: string;
  }): OfflineAuditDeviceState {
    const current = obtenirOfflineAuditLocalStore().devices.get(args.deviceId);
    const next: OfflineAuditDeviceState = {
      deviceId: args.deviceId,
      userAgent: args.userAgent ?? current?.userAgent,
      versionApplication: args.versionApplication ?? current?.versionApplication,
      sourceRuntime: args.sourceRuntime ?? current?.sourceRuntime,
      derniereActionLe: new Date().toISOString(),
      derniereSynchronisationLe: current?.derniereSynchronisationLe,
      synchronisationsReussies: current?.synchronisationsReussies ?? 0,
      synchronisationsEchouees: current?.synchronisationsEchouees ?? 0,
    };
    obtenirOfflineAuditLocalStore().devices.set(args.deviceId, next);
    return next;
  }

  public marquerSynchronisation(deviceId: string, reussie: boolean): void {
    const current = obtenirOfflineAuditLocalStore().devices.get(deviceId);
    if (!current) {
      return;
    }

    obtenirOfflineAuditLocalStore().devices.set(deviceId, {
      ...current,
      derniereSynchronisationLe: new Date().toISOString(),
      synchronisationsReussies: current.synchronisationsReussies + (reussie ? 1 : 0),
      synchronisationsEchouees: current.synchronisationsEchouees + (reussie ? 0 : 1),
    });
  }

  public lister(): OfflineAuditDeviceState[] {
    return [...obtenirOfflineAuditLocalStore().devices.values()];
  }
}
