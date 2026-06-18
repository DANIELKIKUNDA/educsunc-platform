import { PortFileRetryNotification } from '../../application';

// Ce fichier planifie techniquement les retries Notifications.

/** Cette classe calcule un delai technique et alimente la file de retry. */
export class PlanificateurRetryNotification {
  /** Ce constructeur relie le planificateur au port de file de retry. */
  constructor(private readonly portFileRetryNotification: PortFileRetryNotification) {}

  /** Cette methode planifie un retry en appliquant un backoff simple. */
  public async planifier(
    identifiantNotification: string,
    tentative: number,
    maximumRetry: number,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    const delaiRetryMs = this.calculerDelaiRetry(tentative);
    await this.portFileRetryNotification.ajouter(identifiantNotification, {
      ...metadata,
      tentative,
      maximumRetry,
      delaiRetryMs,
    });
  }

  /** Cette methode calcule un delai de retry progressif raisonnable. */
  private calculerDelaiRetry(tentative: number): number {
    const base = 30_000;
    return base * Math.max(1, tentative + 1);
  }
}
