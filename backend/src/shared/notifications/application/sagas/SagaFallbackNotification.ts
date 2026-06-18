import { OrchestrateurFallbackNotification } from '../orchestrators';

// Ce fichier decrit la saga applicative de fallback de notification.

/** Cette classe formalise le workflow event-driven de fallback. */
export class SagaFallbackNotification {
  /** Ce constructeur relie la saga a l'orchestrateur de fallback. */
  constructor(private readonly orchestrateurFallbackNotification: OrchestrateurFallbackNotification) {}

  /** Cette methode lance la saga de fallback. */
  public async executer(identifiantNotification: string, raison: string): Promise<void> {
    await this.orchestrateurFallbackNotification.executer(identifiantNotification, raison);
  }
}
