import type { NotificationContext } from '../../../context';
import type {
  NotificationSecurityDecision,
  NotificationSecurityDecisionEnvelope,
  NotificationSecurityEvent,
} from '../NotificationsSecurityIntegrationTypes';

// Ce fichier convertit les sorties du module Security vers des objets stables pour Notifications.

/** Cette classe transforme les decisions et evenements Security dans le langage du module Notifications. */
export class NotificationSecurityEventMapper {
  /** Cette methode construit une decision Notifications a partir d'une decision du module Security. */
  public static versDecision(
    enveloppe: NotificationSecurityDecisionEnvelope,
    contexteNotification: NotificationContext,
    metadata: Readonly<Record<string, unknown>> = {},
  ): NotificationSecurityDecision {
    return {
      autorise: enveloppe.decision.autorise,
      action: enveloppe.decision.permissionDemandee,
      raisonRefus: enveloppe.decision.raisonRefus,
      scopeValide: enveloppe.decision.scopeValide,
      restrictionRespectee: enveloppe.decision.restrictionRespectee,
      organisationId:
        contexteNotification.organisationId ?? enveloppe.contexteActif?.idOrganisationActive,
      ecoleId: contexteNotification.ecoleId ?? enveloppe.contexteActif?.idEcoleActive,
      acteurId: contexteNotification.acteurId,
      correlationId: contexteNotification.correlationId,
      requestId: contexteNotification.requestId,
      metadata: { ...metadata },
    };
  }

  /** Cette methode traduit un evenement Security en forme simple pour le pont Notifications. */
  public static versEvenement(
    type: NotificationSecurityEvent['type'],
    action: string,
    succes: boolean,
    details: Record<string, unknown> = {},
  ): NotificationSecurityEvent {
    return {
      type,
      action,
      succes,
      idUtilisateur: typeof details.idUtilisateur === 'string' ? details.idUtilisateur : undefined,
      idOrganisationActive:
        typeof details.idOrganisationActive === 'string'
          ? details.idOrganisationActive
          : undefined,
      idEcoleActive:
        typeof details.idEcoleActive === 'string' ? details.idEcoleActive : undefined,
      details: { ...details },
    };
  }
}
