import { RequeteArchivesNotifications, RequeteChronologieNotification, RequeteDeadLettersNotifications, RequeteDetailsNotification, RequeteDiagnosticReplayNotification, RequeteHistoriqueRetriesNotification, RequeteListerNotifications, RequeteMonitoringNotifications, RequeteTenantNotifications, RequeteTraceEscaladeNotification } from '../queries';
import { ModeleLectureArchivesNotifications, ModeleLectureChronologieNotification, ModeleLectureDeadLettersNotifications, ModeleLectureDetailsNotification, ModeleLectureDiagnosticReplayNotification, ModeleLectureHistoriqueRetriesNotification, ModeleLectureListeNotifications, ModeleLectureMonitoringNotifications, ModeleLectureTenantNotifications, ModeleLectureTraceEscaladeNotification } from '../read-models';

// Ce fichier declare le port de lecture des projections Notifications.

/** Cette interface expose les lectures applicatives sans fuite vers la persistence. */
export interface PortLectureNotifications {
  /** Cette methode liste les notifications selon les filtres applicatifs. */
  lister(requete: RequeteListerNotifications): Promise<ModeleLectureListeNotifications>;

  /** Cette methode retourne les details d'une notification. */
  obtenirDetails(requete: RequeteDetailsNotification): Promise<ModeleLectureDetailsNotification | null>;

  /** Cette methode retourne la chronologie projetee d'une notification. */
  obtenirChronologie(requete: RequeteChronologieNotification): Promise<ModeleLectureChronologieNotification>;

  /** Cette methode retourne l'historique de retries d'une notification. */
  obtenirHistoriqueRetries(requete: RequeteHistoriqueRetriesNotification): Promise<ModeleLectureHistoriqueRetriesNotification>;

  /** Cette methode retourne la vue de monitoring Notifications. */
  obtenirMonitoring(requete: RequeteMonitoringNotifications): Promise<ModeleLectureMonitoringNotifications>;

  /** Cette methode retourne les dead letters Notifications. */
  obtenirDeadLetters(requete: RequeteDeadLettersNotifications): Promise<ModeleLectureDeadLettersNotifications>;

  /** Cette methode retourne les notifications archivees. */
  obtenirArchives(requete: RequeteArchivesNotifications): Promise<ModeleLectureArchivesNotifications>;

  /** Cette methode retourne le diagnostic de rejeu d'une notification. */
  obtenirDiagnosticReplay(requete: RequeteDiagnosticReplayNotification): Promise<ModeleLectureDiagnosticReplayNotification>;

  /** Cette methode retourne la trace d'escalade d'une notification. */
  obtenirTraceEscalade(requete: RequeteTraceEscaladeNotification): Promise<ModeleLectureTraceEscaladeNotification>;

  /** Cette methode retourne une vue consolidee des notifications d'un tenant. */
  obtenirVueTenant(requete: RequeteTenantNotifications): Promise<ModeleLectureTenantNotifications>;
}
