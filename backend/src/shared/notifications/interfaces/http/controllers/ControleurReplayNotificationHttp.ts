import type {
  CommandeRejouerNotification,
  DtoDetailsNotification,
  ObtenirDiagnosticReplayNotification,
  RejouerNotification,
  RequeteDiagnosticReplayNotification,
} from '../../../application';
import {
  executerDependance,
  enrichirContexte,
  envelopperReponse,
  extraireContexteRuntime,
} from './NotificationsControllerSupport';
import type { ReponseControleurHttpNotifications, RequeteHttpNotifications } from './HttpNotificationsControllerTypes';
import { PresentateurHttpReplayNotification } from '../presenters';
import { ValidateurHttpReplayNotification } from '../validators';

// Ce fichier declare le controller HTTP de replay Notifications.

/** Cette classe expose les endpoints de rejeu et de diagnostic de replay. */
export class ControleurReplayNotificationHttp {
  /** Ce constructeur assemble les cas d'usage de replay. */
  constructor(
    private readonly rejouerNotification: RejouerNotification,
    private readonly obtenirDiagnosticReplayNotification: ObtenirDiagnosticReplayNotification,
  ) {}

  /** Cette methode declenche un rejeu technique d'une notification. */
  public async rejouer(
    requete: RequeteHttpNotifications<unknown, { id?: string }>,
  ): Promise<ReponseControleurHttpNotifications<DtoDetailsNotification>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const commande = enrichirContexte(
      ValidateurHttpReplayNotification.valider(requete.params, requete.body),
      contexte,
    ) as CommandeRejouerNotification;
    const sortie = await executerDependance(this.rejouerNotification, commande);
    return envelopperReponse(
      PresentateurHttpReplayNotification.presenterRejeu(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode retourne le diagnostic HTTP d'un rejeu de notification. */
  public async obtenirDiagnostic(
    requete: RequeteHttpNotifications<never, { id?: string }>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpReplayNotification.presenterDiagnostic>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      {
        identifiantNotification: requete.params?.id,
      },
      contexte,
    ) as RequeteDiagnosticReplayNotification;
    const sortie = await executerDependance(this.obtenirDiagnosticReplayNotification, query);
    return envelopperReponse(
      PresentateurHttpReplayNotification.presenterDiagnostic(sortie),
      contexte,
      commenceLe,
    );
  }
}
