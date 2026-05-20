// Ce port relie AUTH a la persistance locale et a la synchronisation offline.
export interface OfflineAuthPort {
  stockerAuthLocale(params: {
    utilisateurId: string;
    deviceId: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
  restaurerAuthLocale(utilisateurId: string, deviceId: string): Promise<Record<string, unknown> | null>;
  synchroniserAuthOffline(utilisateurId: string, deviceId: string): Promise<void>;
}
