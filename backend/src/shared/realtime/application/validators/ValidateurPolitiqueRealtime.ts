import type { AppliquerPolitiqueDiffusionRealtimeCommand } from '../commands';

export class ValidateurPolitiqueRealtime {
  public valider(commande: AppliquerPolitiqueDiffusionRealtimeCommand): void {
    if (commande.canauxAutorises.length === 0) {
      throw new Error('Aucun canal realtime autorise');
    }
  }
}
