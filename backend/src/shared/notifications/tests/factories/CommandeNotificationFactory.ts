import type { CommandeCreerNotification } from 'shared/notifications/application';
import {
  ACTEUR_NOTIFICATION_TEST,
  CORRELATION_NOTIFICATION_TEST,
  DESTINATAIRE_NOTIFICATION_TEST,
  ECOLE_NOTIFICATION_TEST,
  ORGANISATION_NOTIFICATION_TEST,
  REQUEST_NOTIFICATION_TEST,
} from '../fixtures/NotificationsFixtures';

// Ce fichier fabrique des commandes applicatives stables pour les tests Notifications.

/** Cette classe construit des commandes de creation prêtes pour les tests applicatifs. */
export class CommandeNotificationFactory {
  /** Cette methode cree une commande de creation valide avec possibilite de surcharge. */
  public static creer(
    surcharges: Partial<CommandeCreerNotification> = {},
  ): CommandeCreerNotification {
    return {
      type: 'INFORMATION_GENERALE',
      priorite: 'NORMAL',
      portee: 'USER',
      temporalite: 'IMMEDIATE',
      visibilite: 'PRIVATE',
      source: 'SYSTEM_EVENT',
      strategieLivraison: 'FALLBACK_CHAIN',
      canaux: ['IN_APP', 'EMAIL'],
      organisationId: ORGANISATION_NOTIFICATION_TEST,
      ecoleId: ECOLE_NOTIFICATION_TEST,
      utilisateurId: DESTINATAIRE_NOTIFICATION_TEST,
      acteurId: ACTEUR_NOTIFICATION_TEST,
      correlationId: CORRELATION_NOTIFICATION_TEST,
      requestId: REQUEST_NOTIFICATION_TEST,
      titre: 'Notification de test',
      message: 'Message de notification de test',
      placeholders: {
        eleve: 'Eleve Test',
      },
      metadonnees: {
        scenario: 'test',
      },
      destinataires: [
        {
          destinataireId: DESTINATAIRE_NOTIFICATION_TEST,
          typeDestinataire: 'USER',
          canauxAutorises: ['IN_APP', 'EMAIL'],
        },
      ],
      ...surcharges,
    };
  }
}
