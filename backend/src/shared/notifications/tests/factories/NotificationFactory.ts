import {
  Notification,
  ContexteNotification,
  ContenuNotification,
  MetadonneesNotification,
  InformationsReplay,
  InformationsRetry,
  PolitiqueAntiSpam,
  PolitiqueAuditNotification,
  PolitiqueBudgetNotification,
  PolitiqueExpiration,
  PolitiqueGouvernanceLivraison,
  PolitiqueMonitoringNotification,
  PolitiqueOfflineNotification,
  PolitiquePanneFournisseur,
  PolitiqueQuotasNotification,
  PolitiqueRetry,
  PolitiqueSecuriteContenu,
  PolitiqueSecuriteNotification,
  PolitiqueThrottling,
  ConsentementCommunication,
  DestinataireNotification,
} from 'shared/notifications/domain';
import {
  ACTEUR_NOTIFICATION_TEST,
  CORRELATION_NOTIFICATION_TEST,
  DESTINATAIRE_NOTIFICATION_TEST,
  ECOLE_NOTIFICATION_TEST,
  ORGANISATION_NOTIFICATION_TEST,
  REQUEST_NOTIFICATION_TEST,
} from '../fixtures/NotificationsFixtures';

// Ce fichier fabrique des agregats domaine stables pour les tests Notifications.

/** Cette classe construit des notifications de domaine coherentes pour les tests. */
export class NotificationFactory {
  /** Cette methode cree une notification complete et valide a partir de quelques surcharges. */
  public static creer(
    surcharges: Partial<Parameters<typeof Notification.creer>[0]> = {},
  ): Notification {
    const destinataire = new DestinataireNotification(
      DESTINATAIRE_NOTIFICATION_TEST,
      'USER',
      'DIRECT_TARGET',
      'PRIVATE',
      ['IN_APP', 'EMAIL'],
      'USER',
      'user@test.local',
      DESTINATAIRE_NOTIFICATION_TEST,
      undefined,
      undefined,
      undefined,
      ECOLE_NOTIFICATION_TEST,
      ORGANISATION_NOTIFICATION_TEST,
    );

    return Notification.creer({
      type: 'INFORMATION_GENERALE',
      priorite: 'NORMAL',
      portee: 'USER',
      temporalite: 'IMMEDIATE',
      visibilite: 'PRIVATE',
      source: 'SYSTEM_EVENT',
      strategieLivraison: 'FALLBACK_CHAIN',
      criticiteLivraison: 'IMPORTANT',
      niveauAttentionUtilisateur: 'NORMAL',
      exigenceAudit: 'BASIC',
      exigenceMonitoring: 'DETAILED',
      comportementOffline: 'DELAYABLE',
      contenu: new ContenuNotification('Message domaine de test', 'Titre domaine de test'),
      contexte: new ContexteNotification(
        'SYSTEM_EVENT',
        ORGANISATION_NOTIFICATION_TEST,
        ECOLE_NOTIFICATION_TEST,
        DESTINATAIRE_NOTIFICATION_TEST,
        DESTINATAIRE_NOTIFICATION_TEST,
        'EvenementTest',
        ACTEUR_NOTIFICATION_TEST,
        CORRELATION_NOTIFICATION_TEST,
        REQUEST_NOTIFICATION_TEST,
        { origine: 'tests' },
      ),
      metadonnees: new MetadonneesNotification(10, 1, ['test'], { module: 'notifications' }),
      destinataires: [destinataire],
      canaux: ['IN_APP', 'EMAIL'],
      informationsRetry: new InformationsRetry(0, 3),
      informationsReplay: new InformationsReplay(0),
      politiqueRetry: new PolitiqueRetry('FIXED_RETRY', 3, 1000),
      politiqueExpiration: new PolitiqueExpiration('TIME_BASED', new Date(Date.now() + 3600_000)),
      politiqueQuotas: new PolitiqueQuotasNotification({ IN_APP: 100 }),
      politiqueBudget: new PolitiqueBudgetNotification(500),
      politiqueThrottling: new PolitiqueThrottling({ IN_APP: 10 }),
      politiqueAntiSpam: new PolitiqueAntiSpam(5000),
      politiqueGouvernanceLivraison: new PolitiqueGouvernanceLivraison(false),
      politiqueSecurite: new PolitiqueSecuriteNotification(true),
      politiqueOffline: new PolitiqueOfflineNotification('DELAYABLE'),
      politiquePanneFournisseur: new PolitiquePanneFournisseur(true, true),
      politiqueAudit: new PolitiqueAuditNotification('BASIC'),
      politiqueMonitoring: new PolitiqueMonitoringNotification('DETAILED', 'IMPORTANT'),
      politiqueSecuriteContenu: new PolitiqueSecuriteContenu(),
      consentements: [
        new ConsentementCommunication(
          'consentement-test',
          DESTINATAIRE_NOTIFICATION_TEST,
          'IN_APP',
          'AUTHORIZED',
        ),
      ],
      ...surcharges,
    });
  }
}
