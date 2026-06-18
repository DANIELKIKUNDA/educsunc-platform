import { EntreeChronologieNotification, Notification } from '../../domain';
import {
  ModeleLectureArchivesNotifications,
  ModeleLectureChronologieNotification,
  ModeleLectureDeadLettersNotifications,
  ModeleLectureDetailsNotification,
  ModeleLectureDiagnosticReplayNotification,
  ModeleLectureHistoriqueRetriesNotification,
  ModeleLectureListeNotifications,
  ModeleLectureMonitoringNotifications,
  ModeleLectureTenantNotifications,
  ModeleLectureTraceEscaladeNotification,
} from '../../application';
import {
  EnregistrementDeadLetterNotificationMemoire,
  EnregistrementNotificationMemoire,
  VueTenantNotificationMemoire,
} from './TypesPersistenceNotification';

// Ce fichier convertit les agregats et snapshots memoire en projections de lecture applicatives.

/** Cette classe centralise les transformations techniques du bloc persistence. */
export class MappeurPersistenceNotification {
  /** Cette methode produit un snapshot technique leger depuis l'agregat. */
  public static versEnregistrement(notification: Notification): EnregistrementNotificationMemoire {
    const vueInterne = notification as unknown as {
      canaux: EnregistrementNotificationMemoire['canaux'];
      contenu: {
        obtenirMessage(): string;
        obtenirPlaceholders(): Record<string, string>;
        obtenirTitre?: () => string | undefined;
      };
    };

    return {
      identifiant: notification.obtenirIdentifiant().obtenirValeur(),
      type: notification.type,
      statut: notification.obtenirStatut(),
      priorite: notification.priorite,
      canaux: [...vueInterne.canaux],
      titre: vueInterne.contenu.obtenirTitre?.(),
      message: vueInterne.contenu.obtenirMessage(),
      placeholders: vueInterne.contenu.obtenirPlaceholders(),
      organisationId: notification.contexte.obtenirOrganisationId(),
      ecoleId: notification.contexte.obtenirEcoleId(),
      correlationId: notification.contexte.obtenirCorrelationId(),
      requestId: notification.contexte.obtenirRequestId(),
      compteurRetry: notification.obtenirInformationsRetry().obtenirCompteurRetry(),
      compteurReplay: notification.obtenirInformationsReplay().obtenirCompteurReplay(),
      dateArchivage: notification.obtenirStatut() === 'ARCHIVED' ? notification.misAJourLe : undefined,
      creeLe: notification.creeLe,
      misAJourLe: notification.misAJourLe,
    };
  }

  /** Cette methode convertit un snapshot technique en vue detaillee. */
  public static versModeleDetails(
    enregistrement: EnregistrementNotificationMemoire,
  ): ModeleLectureDetailsNotification {
    return {
      identifiant: enregistrement.identifiant,
      type: enregistrement.type,
      statut: enregistrement.statut,
      priorite: enregistrement.priorite,
      canaux: [...enregistrement.canaux],
      titre: enregistrement.titre,
      message: enregistrement.message,
      placeholders: { ...enregistrement.placeholders },
      organisationId: enregistrement.organisationId,
      ecoleId: enregistrement.ecoleId,
      correlationId: enregistrement.correlationId,
      requestId: enregistrement.requestId,
      creeLe: enregistrement.creeLe,
      misAJourLe: enregistrement.misAJourLe,
    };
  }

  /** Cette methode convertit une liste technique en resultat pagine de lecture. */
  public static versModeleListe(
    enregistrements: readonly EnregistrementNotificationMemoire[],
    page: number,
    taillePage: number,
    total: number,
  ): ModeleLectureListeNotifications {
    return {
      elements: enregistrements.map((enregistrement) => ({
        identifiant: enregistrement.identifiant,
        type: enregistrement.type,
        statut: enregistrement.statut,
        titre: enregistrement.titre,
        messageResume: enregistrement.message.slice(0, 160),
        creeLe: enregistrement.creeLe,
      })),
      page,
      taillePage,
      total,
    };
  }

  /** Cette methode convertit la chronologie stockee en projection applicative. */
  public static versModeleChronologie(
    identifiantNotification: string,
    chronologie: readonly EntreeChronologieNotification[],
  ): ModeleLectureChronologieNotification {
    return {
      identifiantNotification,
      elements: chronologie.map((entree) => ({
        identifiant: entree.obtenirId(),
        typeEvenement: entree.obtenirTypeEvenement(),
        statutAvant: entree.statutAvant,
        statutApres: entree.obtenirStatutApres(),
        horodatage: entree.obtenirHorodatage(),
        correlationId: entree.correlationId,
        requestId: entree.requestId,
        acteur: entree.acteur,
        metadonnees: { ...entree.metadonnees, ...entree.metadonneesForensic },
      })),
    };
  }

  /** Cette methode convertit les retries stockes dans l'agregat en projection applicative. */
  public static versModeleHistoriqueRetries(notification: Notification): ModeleLectureHistoriqueRetriesNotification {
    const tentatives = notification.obtenirTentativesLivraison()
      .filter((tentative) => tentative.obtenirCompteurRetry() > 0)
      .map((tentative) => ({
        compteur: tentative.obtenirCompteurRetry(),
        raison: tentative.erreur,
        horodatage: tentative.misAJourLe,
        initiateur: notification.contexte.obtenirActeurId(),
      }))
      .sort((gauche, droite) => gauche.horodatage.getTime() - droite.horodatage.getTime());

    return {
      identifiantNotification: notification.obtenirIdentifiant().obtenirValeur(),
      retries: tentatives,
    };
  }

  /** Cette methode calcule une vue monitoring globale a partir des snapshots memoire. */
  public static versModeleMonitoring(
    enregistrements: readonly EnregistrementNotificationMemoire[],
    deadLetters: readonly EnregistrementDeadLetterNotificationMemoire[],
  ): ModeleLectureMonitoringNotifications {
    return {
      totalNotifications: enregistrements.length,
      totalEnEchec: enregistrements.filter((element) => element.statut === 'FAILED').length,
      totalEnRetry: enregistrements.filter((element) => element.statut === 'RETRYING').length,
      totalDeadLetters: deadLetters.length,
      fournisseursDegrades: [],
      queuesSaturees: [],
      dateObservation: new Date(),
    };
  }

  /** Cette methode convertit les dead letters en projection paginee. */
  public static versModeleDeadLetters(
    deadLetters: readonly EnregistrementDeadLetterNotificationMemoire[],
    page: number,
    taillePage: number,
    total: number,
  ): ModeleLectureDeadLettersNotifications {
    return {
      elements: deadLetters.map((element) => ({ ...element })),
      page,
      taillePage,
      total,
    };
  }

  /** Cette methode convertit les archives en projection paginee. */
  public static versModeleArchives(
    enregistrements: readonly EnregistrementNotificationMemoire[],
    page: number,
    taillePage: number,
    total: number,
  ): ModeleLectureArchivesNotifications {
    return {
      elements: enregistrements.map((element) => ({
        identifiantNotification: element.identifiant,
        type: element.type,
        dateArchivage: element.dateArchivage ?? element.misAJourLe,
        raisonArchivage: element.raisonArchivage,
        organisationId: element.organisationId,
        ecoleId: element.ecoleId,
      })),
      page,
      taillePage,
      total,
    };
  }

  /** Cette methode convertit l'etat de replay en projection de diagnostic. */
  public static versModeleDiagnosticReplay(notification: Notification): ModeleLectureDiagnosticReplayNotification {
    const informationsReplay = notification.obtenirInformationsReplay();
    return {
      identifiantNotification: notification.obtenirIdentifiant().obtenirValeur(),
      totalReplays: informationsReplay.obtenirCompteurReplay(),
      dernierReplayLe: informationsReplay.obtenirCompteurReplay() > 0 ? notification.misAJourLe : undefined,
      dernierReplayPar: notification.contexte.obtenirActeurId(),
      rebatirChronologie: true,
      autoriserRenduCanal: false,
    };
  }

  /** Cette methode convertit la timeline en trace d'escalade lisible. */
  public static versModeleTraceEscalade(notification: Notification): ModeleLectureTraceEscaladeNotification {
    const elements = notification.obtenirTimeline()
      .filter((entree) => entree.obtenirTypeEvenement().toUpperCase().includes('ESCAL'))
      .map((entree) => ({
        identifiant: entree.obtenirId(),
        raison: entree.obtenirTypeEvenement(),
        acteur: entree.acteur,
        horodatage: entree.obtenirHorodatage(),
        audienceCible: notification.obtenirDestinataires().map((destinataire) => destinataire.obtenirId()),
      }));

    return {
      identifiantNotification: notification.obtenirIdentifiant().obtenirValeur(),
      elements,
    };
  }

  /** Cette methode convertit une vue tenant technique en projection applicative. */
  public static versModeleTenant(vue: VueTenantNotificationMemoire): ModeleLectureTenantNotifications {
    return { ...vue };
  }
}
