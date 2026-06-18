import type { OuvrirConnexionTempsReelCommand } from '../commands';

export class ValidateurConnexionTempsReel {
  public valider(commande: OuvrirConnexionTempsReelCommand): void {
    if (!commande.connexionId.trim() || !commande.utilisateurId.trim()) {
      throw new Error('Connexion realtime invalide');
    }
  }
}
