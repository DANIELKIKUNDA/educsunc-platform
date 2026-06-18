import { ExceptionCommandeDupliquee } from '../exceptions';
import { PortIdempotenceNotification } from '../ports';

// Ce fichier declare le validateur applicatif d'idempotence.

/** Cette classe protege les workflows critiques contre les doublons de commande. */
export class ValidateurIdempotenceNotification {
  /** Ce constructeur relie le validateur au port technique d'idempotence. */
  constructor(private readonly portIdempotence: PortIdempotenceNotification) {}

  /** Cette methode refuse toute commande deja traitee pour la meme cle. */
  public async valider(cle?: string): Promise<void> {
    if (!cle) {
      return;
    }
    if (await this.portIdempotence.estDejaTraitee(cle)) {
      throw new ExceptionCommandeDupliquee();
    }
  }
}
