import { CommandeMettreEnFileNotification } from '../commands';
import { OrchestrateurDiffusionNotification } from '../orchestrators';

// Ce fichier decrit la saga applicative de diffusion multi-canale.

/** Cette classe formalise le workflow event-driven de diffusion multi-canale. */
export class SagaDiffusionMultiCanale {
  /** Ce constructeur relie la saga a l'orchestrateur de diffusion. */
  constructor(private readonly orchestrateurDiffusionNotification: OrchestrateurDiffusionNotification) {}

  /** Cette methode lance la saga de diffusion. */
  public async executer(commande: CommandeMettreEnFileNotification): Promise<void> {
    await this.orchestrateurDiffusionNotification.executer(commande);
  }
}
