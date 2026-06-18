import { PortMonitoringNotification, PortTempsReelNotification } from '../ports';

// Ce fichier orchestre la diffusion future temps reel des notifications.

/** Cette classe prepare le futur branchement realtime sans glisser de dependance framework. */
export class OrchestrateurTempsReelNotification {
  /** Ce constructeur relie l'orchestrateur au port temps reel et au monitoring. */
  constructor(
    private readonly portTempsReelNotification: PortTempsReelNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode diffuse un evenement logique de notification vers le futur temps reel. */
  public async diffuser(
    sujet: string,
    donnees: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    await this.portTempsReelNotification.publier(sujet, donnees);
    await this.portMonitoringNotification.enregistrerSignal('notifications.realtime.diffused', {
      sujet,
    });
  }
}
