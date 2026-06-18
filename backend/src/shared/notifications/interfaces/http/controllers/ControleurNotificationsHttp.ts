import type {
  AccuserReceptionNotification,
  CommandeAccuserReceptionNotification,
  CommandeCreerNotification,
  CommandeEscaladerNotification,
  CreerNotification,
  DtoDetailsNotification,
  EscaladerNotification,
  ListerNotifications,
  ObtenirChronologieNotification,
  ObtenirDetailsNotification,
  RequeteChronologieNotification,
  RequeteDetailsNotification,
  RequeteListerNotifications,
} from '../../../application';
import {
  executerDependance,
  enrichirContexte,
  envelopperReponse,
  exigerResultat,
  extraireContexteRuntime,
} from './NotificationsControllerSupport';
import type { ReponseControleurHttpNotifications, RequeteHttpNotifications } from './HttpNotificationsControllerTypes';
import {
  PresentateurHttpChronologieNotification,
  PresentateurHttpNotification,
} from '../presenters';
import {
  ValidateurHttpAccuseReceptionNotification,
  ValidateurHttpCreationNotification,
  ValidateurHttpChronologieNotification,
  ValidateurHttpEscaladeNotification,
  ValidateurHttpListeNotifications,
} from '../validators';

// Ce fichier declare le controller HTTP principal du module Notifications.

/** Cette classe expose les endpoints HTTP metiers principaux du module Notifications. */
export class ControleurNotificationsHttp {
  /** Ce constructeur assemble les cas d'usage principaux du module. */
  constructor(
    private readonly creerNotification: CreerNotification,
    private readonly listerNotifications: ListerNotifications,
    private readonly obtenirDetailsNotification: ObtenirDetailsNotification,
    private readonly obtenirChronologieNotification: ObtenirChronologieNotification,
    private readonly accuserReceptionNotification: AccuserReceptionNotification,
    private readonly escaladerNotification: EscaladerNotification,
  ) {}

  /** Cette methode cree une notification puis retourne son detail stable. */
  public async creer(
    requete: RequeteHttpNotifications<unknown>,
  ): Promise<ReponseControleurHttpNotifications<DtoDetailsNotification>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const commande = enrichirContexte(
      ValidateurHttpCreationNotification.valider(requete.body),
      contexte,
    ) as CommandeCreerNotification;
    const sortie = await executerDependance(this.creerNotification, commande);
    return envelopperReponse(
      PresentateurHttpNotification.presenterDetail(sortie),
      contexte,
      commenceLe,
      201,
    );
  }

  /** Cette methode retourne une liste paginee de notifications. */
  public async lister(
    requete: RequeteHttpNotifications<never, Record<string, unknown>, Record<string, unknown>>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpNotification.presenterListe>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      ValidateurHttpListeNotifications.valider(requete.query),
      contexte,
    ) as RequeteListerNotifications;
    const sortie = await executerDependance(this.listerNotifications, query);
    return envelopperReponse(
      PresentateurHttpNotification.presenterListe(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode retourne le detail HTTP d'une notification. */
  public async consulterParId(
    requete: RequeteHttpNotifications<never, { id?: string }, Record<string, unknown>>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpNotification.presenterProjectionDetail>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const details = await executerDependance(
      this.obtenirDetailsNotification,
      enrichirContexte(
        {
          identifiantNotification: requete.params?.id,
        },
        contexte,
      ) as RequeteDetailsNotification,
    );
    const sortie = exigerResultat(details, 'La notification demandee est introuvable.');
    return envelopperReponse(
      PresentateurHttpNotification.presenterProjectionDetail(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode retourne la chronologie HTTP d'une notification. */
  public async obtenirChronologie(
    requete: RequeteHttpNotifications<never, { id?: string }, Record<string, unknown>>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpChronologieNotification.presenterChronologie>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      ValidateurHttpChronologieNotification.valider(requete.params, requete.query),
      contexte,
    ) as RequeteChronologieNotification;
    const sortie = await executerDependance(this.obtenirChronologieNotification, query);
    return envelopperReponse(
      PresentateurHttpChronologieNotification.presenterChronologie(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode accuse reception ou lecture d'une notification. */
  public async accuserReception(
    requete: RequeteHttpNotifications<unknown, { id?: string }>,
  ): Promise<ReponseControleurHttpNotifications<DtoDetailsNotification>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const commande = enrichirContexte(
      ValidateurHttpAccuseReceptionNotification.valider(requete.params, requete.body),
      contexte,
    ) as CommandeAccuserReceptionNotification;
    const sortie = await executerDependance(this.accuserReceptionNotification, commande);
    return envelopperReponse(
      PresentateurHttpNotification.presenterDetail(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode escalade une notification vers une audience plus large ou plus critique. */
  public async escalader(
    requete: RequeteHttpNotifications<unknown, { id?: string }>,
  ): Promise<ReponseControleurHttpNotifications<DtoDetailsNotification>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const commande = enrichirContexte(
      ValidateurHttpEscaladeNotification.valider(requete.params, requete.body),
      contexte,
    ) as CommandeEscaladerNotification;
    const sortie = await executerDependance(this.escaladerNotification, commande);
    return envelopperReponse(
      PresentateurHttpNotification.presenterDetail(sortie),
      contexte,
      commenceLe,
    );
  }
}
