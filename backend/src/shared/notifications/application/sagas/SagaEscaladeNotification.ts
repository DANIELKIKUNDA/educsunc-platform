import { CommandeEscaladerNotification } from '../commands';
import { OrchestrateurEscaladeNotification } from '../orchestrators';

// Ce fichier decrit la saga applicative d'escalade de notification.

/** Cette classe formalise le workflow event-driven d'escalade. */
export class SagaEscaladeNotification {
  /** Ce constructeur relie la saga a l'orchestrateur d'escalade. */
  constructor(private readonly orchestrateurEscaladeNotification: OrchestrateurEscaladeNotification) {}

  /** Cette methode lance la saga d'escalade. */
  public async executer(commande: CommandeEscaladerNotification): Promise<void> {
    await this.orchestrateurEscaladeNotification.executer(commande);
  }
}
