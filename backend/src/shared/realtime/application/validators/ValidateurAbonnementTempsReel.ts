import type { AbonnerConnexionTempsReelCommand } from '../commands';

export class ValidateurAbonnementTempsReel {
  public valider(commande: AbonnerConnexionTempsReelCommand): void {
    if (!commande.connexionId.trim() || !commande.canal.trim()) {
      throw new Error('Abonnement realtime invalide');
    }
  }
}
