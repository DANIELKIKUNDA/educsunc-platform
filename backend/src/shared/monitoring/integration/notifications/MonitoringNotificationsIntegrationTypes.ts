// Ce fichier declare les types d integration Notifications pour Monitoring.

export interface MonitoringNotificationMessage {
  readonly canal: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  readonly sujet: string;
  readonly contenu: string;
  readonly destinataires: readonly string[];
  readonly correlationId?: string;
}

export interface MonitoringNotificationsEvenement {
  readonly type: 'ALERT' | 'INCIDENT' | 'DIAGNOSTIC';
  readonly identifiant: string;
  readonly severite: string;
}
