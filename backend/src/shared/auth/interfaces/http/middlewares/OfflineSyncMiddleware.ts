import { AuthOfflineMiddleware as InfrastructureAuthOfflineMiddleware } from 'shared/auth/infrastructure/middlewares/AuthOfflineMiddleware';
import { DeviceHeaders } from '../headers/DeviceHeaders';

// Ce middleware HTTP prepare la reprise offline lorsque le client le demande.
export class OfflineSyncMiddleware {
  constructor(private readonly authOfflineMiddleware: InfrastructureAuthOfflineMiddleware) {}

  // Cette methode tente de precharger les informations offline si l'utilisateur et l'appareil sont connus.
  public async preparer(headers: unknown, utilisateurId?: string): Promise<Record<string, unknown> | null> {
    const deviceId = DeviceHeaders.extraire(headers);
    if (!utilisateurId || !deviceId) {
      return null;
    }

    return this.authOfflineMiddleware.preparer(utilisateurId, deviceId);
  }
}
