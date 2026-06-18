import { SignalMonitoringNotification } from './TypesMonitoringNotification';

// Ce fichier collecte et conserve les signaux de monitoring du moteur Notifications.

/** Cette classe centralise la memoire courte des signaux de monitoring. */
export class CollecteurMetriquesNotification {
  private readonly signaux: SignalMonitoringNotification[] = [];

  /** Ce constructeur fixe une retention memoire simple des signaux. */
  constructor(private readonly retentionMaximale = 500) {}

  /** Cette methode enregistre un signal de monitoring technique. */
  public enregistrer(nom: string, valeurs: Readonly<Record<string, unknown>> = {}): void {
    this.signaux.push({
      nom,
      horodatage: new Date(),
      valeurs: { ...valeurs },
    });

    if (this.signaux.length > this.retentionMaximale) {
      this.signaux.splice(0, this.signaux.length - this.retentionMaximale);
    }
  }

  /** Cette methode retourne les signaux les plus recents connus. */
  public lireSignauxRecents(limite = 100): SignalMonitoringNotification[] {
    return this.signaux.slice(-limite);
  }
}
