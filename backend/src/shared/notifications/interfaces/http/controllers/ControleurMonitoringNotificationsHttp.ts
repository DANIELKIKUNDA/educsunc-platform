import type {
  ObtenirDeadLettersNotifications,
  ObtenirMonitoringNotifications,
  RequeteDeadLettersNotifications,
  RequeteMonitoringNotifications,
} from '../../../application';
import {
  executerDependance,
  enrichirContexte,
  envelopperReponse,
  extraireContexteRuntime,
} from './NotificationsControllerSupport';
import type { ReponseControleurHttpNotifications, RequeteHttpNotifications } from './HttpNotificationsControllerTypes';
import { PresentateurHttpMonitoringNotification } from '../presenters';
import {
  ValidateurHttpDeadLetterNotifications,
  ValidateurHttpMonitoringNotifications,
} from '../validators';

// Ce fichier declare le controller HTTP de monitoring Notifications.

/** Cette classe expose les endpoints de supervision et dead letters. */
export class ControleurMonitoringNotificationsHttp {
  /** Ce constructeur assemble les cas d'usage de monitoring. */
  constructor(
    private readonly obtenirMonitoringNotifications: ObtenirMonitoringNotifications,
    private readonly obtenirDeadLettersNotifications: ObtenirDeadLettersNotifications,
  ) {}

  /** Cette methode retourne la vue de monitoring des notifications. */
  public async obtenirMonitoring(
    requete: RequeteHttpNotifications<never, Record<string, never>, Record<string, unknown>>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpMonitoringNotification.presenterMonitoring>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      ValidateurHttpMonitoringNotifications.valider(requete.query),
      contexte,
    ) as RequeteMonitoringNotifications;
    const sortie = await executerDependance(this.obtenirMonitoringNotifications, query);
    return envelopperReponse(
      PresentateurHttpMonitoringNotification.presenterMonitoring(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode retourne la vue paginee des dead letters. */
  public async obtenirDeadLetters(
    requete: RequeteHttpNotifications<never, Record<string, never>, Record<string, unknown>>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpMonitoringNotification.presenterDeadLetters>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      ValidateurHttpDeadLetterNotifications.valider(requete.query),
      contexte,
    ) as RequeteDeadLettersNotifications;
    const sortie = await executerDependance(this.obtenirDeadLettersNotifications, query);
    return envelopperReponse(
      PresentateurHttpMonitoringNotification.presenterDeadLetters(sortie),
      contexte,
      commenceLe,
    );
  }
}
