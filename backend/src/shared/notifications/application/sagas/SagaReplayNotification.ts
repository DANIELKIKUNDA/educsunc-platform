import { CommandeRejouerNotification } from '../commands';
import { OrchestrateurReplayNotification } from '../orchestrators';

// Ce fichier decrit la saga applicative de rejeu de notification.

/** Cette classe formalise le workflow event-driven de rejeu. */
export class SagaReplayNotification {
  /** Ce constructeur relie la saga a l'orchestrateur de rejeu. */
  constructor(private readonly orchestrateurReplayNotification: OrchestrateurReplayNotification) {}

  /** Cette methode lance la saga de rejeu. */
  public async executer(commande: CommandeRejouerNotification): Promise<void> {
    await this.orchestrateurReplayNotification.executer(commande);
  }
}
