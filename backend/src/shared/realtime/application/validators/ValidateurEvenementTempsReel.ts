import type { PublierEvenementTempsReelCommand } from '../commands';

export class ValidateurEvenementTempsReel {
  public valider(commande: PublierEvenementTempsReelCommand): void {
    if (!commande.type.trim()) {
      throw new Error('Type evenement realtime requis');
    }
    if (commande.utilisateurIds.length === 0) {
      throw new Error('Audience utilisateur requise');
    }
  }
}
