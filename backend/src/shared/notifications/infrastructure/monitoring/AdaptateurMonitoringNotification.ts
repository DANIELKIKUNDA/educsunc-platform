import { PortMonitoringNotification } from '../../application';
import { CollecteurMetriquesNotification } from './CollecteurMetriquesNotification';
import { SurveillanceProvidersNotification } from './SurveillanceProvidersNotification';
import { SurveillanceQueuesNotification } from './SurveillanceQueuesNotification';
import { SnapshotMonitoringNotification } from './TypesMonitoringNotification';

// Ce fichier relie les signaux applicatifs a la supervision technique Notifications.

/** Cette classe implemente le port de monitoring et expose un snapshot global du moteur. */
export class AdaptateurMonitoringNotification implements PortMonitoringNotification {
  /** Ce constructeur assemble le collecteur et les surveillances techniques. */
  constructor(
    private readonly collecteurMetriquesNotification: CollecteurMetriquesNotification,
    private readonly surveillanceQueuesNotification: SurveillanceQueuesNotification,
    private readonly surveillanceProvidersNotification: SurveillanceProvidersNotification,
  ) {}

  /** Cette methode enregistre un signal de monitoring provenant des couches superieures. */
  public async enregistrerSignal(
    nom: string,
    valeurs: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    this.collecteurMetriquesNotification.enregistrer(nom, valeurs);
  }

  /** Cette methode retourne un snapshot global du monitoring technique. */
  public async observer(): Promise<SnapshotMonitoringNotification> {
    return {
      signauxRecents: this.collecteurMetriquesNotification.lireSignauxRecents(),
      files: this.surveillanceQueuesNotification.observer(),
      providers: await this.surveillanceProvidersNotification.observer(),
      collecteLe: new Date(),
    };
  }
}
