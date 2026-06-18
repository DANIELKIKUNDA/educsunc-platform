import { CommandeControlerRetryNotification } from '../commands';
import { OrchestrateurRetryNotification } from '../orchestrators';

// Ce fichier decrit la saga applicative de retry de notification.

/** Cette classe formalise le workflow event-driven de retry. */
export class SagaRetryNotification {
  /** Ce constructeur relie la saga a l'orchestrateur de retry. */
  constructor(private readonly orchestrateurRetryNotification: OrchestrateurRetryNotification) {}

  /** Cette methode lance la saga de retry. */
  public async executer(commande: CommandeControlerRetryNotification): Promise<void> {
    await this.orchestrateurRetryNotification.executer(commande);
  }
}
