import type { NotificationTempsReelIntegrationRecord, NotificationTempsReelIntegrationRequest } from '../NotificationsTempsReelIntegrationTypes';

// Ce fichier traduit les demandes logiques Notifications vers un format stable d'integration temps reel.

/** Cette classe transforme une demande de diffusion en enregistrement local et charge portable. */
export class NotificationTempsReelEventMapper {
  /** Cette methode convertit une demande logique en enregistrement memorisable. */
  public static versEnregistrement(
    demande: NotificationTempsReelIntegrationRequest,
  ): NotificationTempsReelIntegrationRecord {
    return {
      sujet: demande.sujet,
      typeEvenement: demande.typeEvenement,
      notificationId: demande.notificationId,
      organisationId: demande.organisationId,
      ecoleId: demande.ecoleId,
      correlationId: demande.correlationId,
      requestId: demande.requestId,
      acteurId: demande.acteurId,
      donnees: { ...demande.donnees },
      publieLe: new Date().toISOString(),
    };
  }

  /** Cette methode prepare la charge logique remise au port temps reel Notifications. */
  public static versChargePublication(
    demande: NotificationTempsReelIntegrationRequest,
  ): Readonly<Record<string, unknown>> {
    return {
      notificationId: demande.notificationId,
      organisationId: demande.organisationId,
      ecoleId: demande.ecoleId,
      acteurId: demande.acteurId,
      correlationId: demande.correlationId,
      requestId: demande.requestId,
      typeEvenement: demande.typeEvenement,
      ...demande.donnees,
    };
  }
}
