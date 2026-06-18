import { CommandeExpirerNotification } from '../commands';
import { OrchestrateurExpirationNotification } from '../orchestrators';

// Ce fichier decrit la saga applicative d'expiration de notification.

/** Cette classe formalise le workflow event-driven d'expiration. */
export class SagaExpirationNotification {
  /** Ce constructeur relie la saga a l'orchestrateur d'expiration. */
  constructor(private readonly orchestrateurExpirationNotification: OrchestrateurExpirationNotification) {}

  /** Cette methode lance la saga d'expiration. */
  public async executer(commande: CommandeExpirerNotification): Promise<void> {
    await this.orchestrateurExpirationNotification.executer(commande);
  }
}
