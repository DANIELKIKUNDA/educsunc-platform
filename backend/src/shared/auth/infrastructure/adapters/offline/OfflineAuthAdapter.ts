import { OfflineAuthPort } from '../../../application/ports/offline/OfflineAuthPort';

// Cet adaptateur fournit un stockage local simple pour l'authentification offline.
export class OfflineAuthAdapter implements OfflineAuthPort {
  private readonly stockage = new Map<string, Record<string, unknown>>();

  public async stockerAuthLocale(params: {
    utilisateurId: string;
    deviceId: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    this.stockage.set(this.construireCle(params.utilisateurId, params.deviceId), { ...params.payload });
  }

  public async restaurerAuthLocale(utilisateurId: string, deviceId: string): Promise<Record<string, unknown> | null> {
    return this.stockage.get(this.construireCle(utilisateurId, deviceId)) ?? null;
  }

  public async synchroniserAuthOffline(utilisateurId: string, deviceId: string): Promise<void> {
    void utilisateurId;
    void deviceId;
  }

  private construireCle(utilisateurId: string, deviceId: string): string {
    return `${utilisateurId}:${deviceId}`;
  }
}
