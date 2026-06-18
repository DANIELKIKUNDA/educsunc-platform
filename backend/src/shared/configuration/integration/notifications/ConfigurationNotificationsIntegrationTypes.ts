import type { ConfigurationContext } from '../../context';

// Ce fichier declare les types du pont Notifications.

export interface ConfigurationNotificationEvenement {
  readonly type: 'CONFIG_CHANGED' | 'CONFIG_LOCKED' | 'CONFIG_PROPAGATED';
  readonly contexte: ConfigurationContext;
  readonly audience: 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';
  readonly message: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConfigurationNotificationMessage {
  readonly canal: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
  readonly titre: string;
  readonly contenu: string;
  readonly configurationId: string;
}

export interface ConfigurationNotificationsSnapshot {
  readonly totalMessages: number;
  readonly messages: readonly ConfigurationNotificationMessage[];
}
