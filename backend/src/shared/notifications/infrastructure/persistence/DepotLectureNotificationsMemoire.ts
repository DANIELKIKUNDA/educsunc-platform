import { CanalNotification } from '../../domain';
import {
  PortLectureNotifications,
  RequeteArchivesNotifications,
  RequeteChronologieNotification,
  RequeteDeadLettersNotifications,
  RequeteDetailsNotification,
  RequeteDiagnosticReplayNotification,
  RequeteHistoriqueRetriesNotification,
  RequeteListerNotifications,
  RequeteMonitoringNotifications,
  RequeteTenantNotifications,
  RequeteTraceEscaladeNotification,
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
import { MappeurPersistenceNotification } from './MappeurPersistenceNotification';
import { RegistreNotificationsMemoire } from './RegistreNotificationsMemoire';

// Ce fichier implemente les lectures applicatives Notifications sur un registre memoire.

/** Cette classe sert les projections de lecture a partir du store memoire technique. */
export class DepotLectureNotificationsMemoire implements PortLectureNotifications {
  /** Ce constructeur relie le depot de lecture au registre memoire partage. */
  constructor(private readonly registreNotificationsMemoire: RegistreNotificationsMemoire) {}

  /** Cette methode liste les notifications selon les filtres applicatifs. */
  public async lister(requete: RequeteListerNotifications): Promise<ModeleLectureListeNotifications> {
    const filtres = this.filtrerEnregistrementsBase().filter((element) => {
      if (requete.organisationId && element.organisationId !== requete.organisationId) {
        return false;
      }
      if (requete.ecoleId && element.ecoleId !== requete.ecoleId) {
        return false;
      }
      if (requete.statut && element.statut !== requete.statut) {
        return false;
      }
      if (requete.type && element.type !== requete.type) {
        return false;
      }
      if (requete.canal && !element.canaux.includes(requete.canal as CanalNotification)) {
        return false;
      }
      if (requete.dateDebut && element.creeLe.getTime() < requete.dateDebut.getTime()) {
        return false;
      }
      if (requete.dateFin && element.creeLe.getTime() > requete.dateFin.getTime()) {
        return false;
      }
      return true;
    });

    const { page, taillePage } = requete;
    const debut = (page - 1) * taillePage;
    const elements = filtres.slice(debut, debut + taillePage);

    return MappeurPersistenceNotification.versModeleListe(elements, page, taillePage, filtres.length);
  }

  /** Cette methode retourne les details d'une notification. */
  public async obtenirDetails(
    requete: RequeteDetailsNotification,
  ): Promise<ModeleLectureDetailsNotification | null> {
    const enregistrement = this.registreNotificationsMemoire.enregistrements.get(requete.identifiantNotification);
    if (!enregistrement) {
      return null;
    }
    if (requete.organisationId && enregistrement.organisationId !== requete.organisationId) {
      return null;
    }
    if (requete.ecoleId && enregistrement.ecoleId !== requete.ecoleId) {
      return null;
    }
    return MappeurPersistenceNotification.versModeleDetails(enregistrement);
  }

  /** Cette methode retourne la chronologie projetee d'une notification. */
  public async obtenirChronologie(
    requete: RequeteChronologieNotification,
  ): Promise<ModeleLectureChronologieNotification> {
    const chronologie = this.registreNotificationsMemoire.chronologies.get(requete.identifiantNotification) ?? [];
    return MappeurPersistenceNotification.versModeleChronologie(requete.identifiantNotification, chronologie);
  }

  /** Cette methode retourne l'historique de retries d'une notification. */
  public async obtenirHistoriqueRetries(
    requete: RequeteHistoriqueRetriesNotification,
  ): Promise<ModeleLectureHistoriqueRetriesNotification> {
    const notification = this.registreNotificationsMemoire.notifications.get(requete.identifiantNotification);
    if (!notification) {
      return {
        identifiantNotification: requete.identifiantNotification,
        retries: [],
      };
    }
    return MappeurPersistenceNotification.versModeleHistoriqueRetries(notification);
  }

  /** Cette methode retourne la vue de monitoring Notifications. */
  public async obtenirMonitoring(
    requete: RequeteMonitoringNotifications,
  ): Promise<ModeleLectureMonitoringNotifications> {
    const enregistrements = this.filtrerEnregistrementsBase().filter((element) => {
      if (requete.organisationId && element.organisationId !== requete.organisationId) {
        return false;
      }
      if (requete.ecoleId && element.ecoleId !== requete.ecoleId) {
        return false;
      }
      return true;
    });
    const deadLetters = this.registreNotificationsMemoire.deadLetters.filter((element) => {
      if (requete.organisationId && element.organisationId !== requete.organisationId) {
        return false;
      }
      if (requete.ecoleId && element.ecoleId !== requete.ecoleId) {
        return false;
      }
      return true;
    });

    return MappeurPersistenceNotification.versModeleMonitoring(enregistrements, deadLetters);
  }

  /** Cette methode retourne les dead letters Notifications. */
  public async obtenirDeadLetters(
    requete: RequeteDeadLettersNotifications,
  ): Promise<ModeleLectureDeadLettersNotifications> {
    const filtres = this.registreNotificationsMemoire.deadLetters.filter((element) => {
      if (requete.organisationId && element.organisationId !== requete.organisationId) {
        return false;
      }
      if (requete.ecoleId && element.ecoleId !== requete.ecoleId) {
        return false;
      }
      return true;
    });
    const debut = (requete.page - 1) * requete.taillePage;
    const elements = filtres.slice(debut, debut + requete.taillePage);
    return MappeurPersistenceNotification.versModeleDeadLetters(
      elements,
      requete.page,
      requete.taillePage,
      filtres.length,
    );
  }

  /** Cette methode retourne les notifications archivees. */
  public async obtenirArchives(
    requete: RequeteArchivesNotifications,
  ): Promise<ModeleLectureArchivesNotifications> {
    const filtres = this.filtrerEnregistrementsBase()
      .filter((element) => element.statut === 'ARCHIVED')
      .filter((element) => {
        if (requete.organisationId && element.organisationId !== requete.organisationId) {
          return false;
        }
        if (requete.ecoleId && element.ecoleId !== requete.ecoleId) {
          return false;
        }
        if (requete.dateDebutArchivage && (!element.dateArchivage || element.dateArchivage.getTime() < requete.dateDebutArchivage.getTime())) {
          return false;
        }
        if (requete.dateFinArchivage && (!element.dateArchivage || element.dateArchivage.getTime() > requete.dateFinArchivage.getTime())) {
          return false;
        }
        return true;
      });

    const debut = (requete.page - 1) * requete.taillePage;
    const elements = filtres.slice(debut, debut + requete.taillePage);
    return MappeurPersistenceNotification.versModeleArchives(
      elements,
      requete.page,
      requete.taillePage,
      filtres.length,
    );
  }

  /** Cette methode retourne le diagnostic de rejeu d'une notification. */
  public async obtenirDiagnosticReplay(
    requete: RequeteDiagnosticReplayNotification,
  ): Promise<ModeleLectureDiagnosticReplayNotification> {
    const notification = this.registreNotificationsMemoire.notifications.get(requete.identifiantNotification);
    if (!notification) {
      return {
        identifiantNotification: requete.identifiantNotification,
        totalReplays: 0,
        rebatirChronologie: true,
        autoriserRenduCanal: false,
      };
    }
    return MappeurPersistenceNotification.versModeleDiagnosticReplay(notification);
  }

  /** Cette methode retourne la trace d'escalade d'une notification. */
  public async obtenirTraceEscalade(
    requete: RequeteTraceEscaladeNotification,
  ): Promise<ModeleLectureTraceEscaladeNotification> {
    const notification = this.registreNotificationsMemoire.notifications.get(requete.identifiantNotification);
    if (!notification) {
      return {
        identifiantNotification: requete.identifiantNotification,
        elements: [],
      };
    }
    return MappeurPersistenceNotification.versModeleTraceEscalade(notification);
  }

  /** Cette methode retourne une vue consolidee des notifications d'un tenant. */
  public async obtenirVueTenant(
    requete: RequeteTenantNotifications,
  ): Promise<ModeleLectureTenantNotifications> {
    const enregistrements = this.filtrerEnregistrementsBase().filter((element) => {
      if (element.organisationId !== requete.organisationId) {
        return false;
      }
      if (requete.ecoleId && element.ecoleId !== requete.ecoleId) {
        return false;
      }
      return true;
    });
    const deadLetters = this.registreNotificationsMemoire.deadLetters.filter((element) => {
      if (element.organisationId !== requete.organisationId) {
        return false;
      }
      if (requete.ecoleId && element.ecoleId !== requete.ecoleId) {
        return false;
      }
      return true;
    });

    return MappeurPersistenceNotification.versModeleTenant({
      organisationId: requete.organisationId,
      ecoleId: requete.ecoleId,
      totalNotifications: enregistrements.length,
      totalArchivees: enregistrements.filter((element) => element.statut === 'ARCHIVED').length,
      totalDeadLetters: deadLetters.length,
      totalEnEchec: enregistrements.filter((element) => element.statut === 'FAILED').length,
      dateObservation: new Date(),
    });
  }

  /** Cette methode retourne tous les snapshots en memoire tries du plus recent au plus ancien. */
  private filtrerEnregistrementsBase() {
    return [...this.registreNotificationsMemoire.enregistrements.values()]
      .sort((gauche, droite) => droite.creeLe.getTime() - gauche.creeLe.getTime());
  }
}
