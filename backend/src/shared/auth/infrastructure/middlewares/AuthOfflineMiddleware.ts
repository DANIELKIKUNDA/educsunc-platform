import { OfflineAuthPort } from '../../application/ports/offline/OfflineAuthPort';

// Ce middleware technique prepare la reprise d'authentification offline.
export class AuthOfflineMiddleware {
  constructor(private readonly offlineAuthPort: OfflineAuthPort) {}

  public async preparer(utilisateurId: string, deviceId: string): Promise<Record<string, unknown> | null> {
    return this.offlineAuthPort.restaurerAuthLocale(utilisateurId, deviceId);
  }
}
