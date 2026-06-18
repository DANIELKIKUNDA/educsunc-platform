import { OrchestrateurTempsReelNotification } from '../../../application';
import {
  envelopperReponse,
  extraireContexteRuntime,
} from './NotificationsControllerSupport';
import type { ReponseControleurHttpNotifications, RequeteHttpNotifications } from './HttpNotificationsControllerTypes';
import { PresentateurHttpAdministrationNotifications } from '../presenters';
import { ValidateurHttpTempsReelNotificationFutur } from '../validators';

// Ce fichier declare le controller HTTP du futur temps reel Notifications.

/** Cette classe expose les contrats HTTP preparatoires du futur temps reel. */
export class ControleurTempsReelNotificationFuturHttp {
  /** Ce constructeur relie le controller a l'orchestrateur temps reel futur. */
  constructor(
    private readonly orchestrateurTempsReelNotification: OrchestrateurTempsReelNotification,
  ) {}

  /** Cette methode retourne les capacites actuellement supportees par la couche temps reel. */
  public async obtenirCapacites(
    requete: RequeteHttpNotifications,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpAdministrationNotifications.presenterCapacitesTempsReel>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    return envelopperReponse(
      PresentateurHttpAdministrationNotifications.presenterCapacitesTempsReel(),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode publie un message de test vers la facade future temps reel. */
  public async publierTest(
    requete: RequeteHttpNotifications<unknown>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpAdministrationNotifications.presenterPublicationTempsReel>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const entree = ValidateurHttpTempsReelNotificationFutur.valider(requete.body);
    await this.orchestrateurTempsReelNotification.diffuser(entree.sujet, {
      ...entree.donnees,
      organisationId: entree.organisationId ?? contexte.organisationId,
      ecoleId: entree.ecoleId ?? contexte.ecoleId,
      correlationId: entree.correlationId ?? contexte.correlationId,
      requestId: entree.requestId ?? contexte.requestId,
      acteurId: entree.acteurId ?? contexte.utilisateurId,
    });
    return envelopperReponse(
      PresentateurHttpAdministrationNotifications.presenterPublicationTempsReel(entree.sujet),
      contexte,
      commenceLe,
      202,
    );
  }
}
