import type {
  CommandeControlerRetryNotification,
  ControlerRetryNotification,
  DtoDetailsNotification,
  ObtenirHistoriqueRetriesNotification,
  RequeteHistoriqueRetriesNotification,
} from '../../../application';
import {
  executerDependance,
  enrichirContexte,
  envelopperReponse,
  extraireContexteRuntime,
} from './NotificationsControllerSupport';
import type { ReponseControleurHttpNotifications, RequeteHttpNotifications } from './HttpNotificationsControllerTypes';
import { PresentateurHttpRetryNotification } from '../presenters';
import { ValidateurHttpRetryNotification } from '../validators';

// Ce fichier declare le controller HTTP de retry Notifications.

/** Cette classe expose le pilotage HTTP du retry et de son historique. */
export class ControleurRetryNotificationHttp {
  /** Ce constructeur assemble les cas d'usage de retry. */
  constructor(
    private readonly controlerRetryNotification: ControlerRetryNotification,
    private readonly obtenirHistoriqueRetriesNotification: ObtenirHistoriqueRetriesNotification,
  ) {}

  /** Cette methode declenche ou pilote un retry de notification. */
  public async controler(
    requete: RequeteHttpNotifications<unknown, { id?: string }>,
  ): Promise<ReponseControleurHttpNotifications<DtoDetailsNotification>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const commande = enrichirContexte(
      ValidateurHttpRetryNotification.valider(requete.params, requete.body),
      contexte,
    ) as CommandeControlerRetryNotification;
    const sortie = await executerDependance(this.controlerRetryNotification, commande);
    return envelopperReponse(
      PresentateurHttpRetryNotification.presenterControle(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode retourne l'historique HTTP de retry d'une notification. */
  public async obtenirHistorique(
    requete: RequeteHttpNotifications<never, { id?: string }>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpRetryNotification.presenterHistorique>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      {
        identifiantNotification: requete.params?.id,
      },
      contexte,
    ) as RequeteHistoriqueRetriesNotification;
    const sortie = await executerDependance(this.obtenirHistoriqueRetriesNotification, query);
    return envelopperReponse(
      PresentateurHttpRetryNotification.presenterHistorique(sortie),
      contexte,
      commenceLe,
    );
  }
}
