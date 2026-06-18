import type { MonitoringNotificationsEvenement, MonitoringNotificationMessage } from '../MonitoringNotificationsIntegrationTypes';

// Ce fichier declare le mapper Notifications du module Monitoring.

export class MonitoringNotificationsMapper {
  public static versMessage(evenement: MonitoringNotificationsEvenement): MonitoringNotificationMessage {
    return {
      canal: 'IN_APP',
      sujet: `[Monitoring] ${evenement.type} ${evenement.identifiant}`,
      contenu: `Un evenement ${evenement.type} de severite ${evenement.severite} a ete observe.`,
      destinataires: ['ops-team'],
    };
  }
}
