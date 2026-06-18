import type { PublierEvenementTempsReelCommand } from '../../../realtime/application';

export interface RealtimeNotificationEvenement {
  readonly type: string;
  readonly audience: readonly string[];
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface RealtimeNotificationsSnapshot {
  readonly totalMessages: number;
  readonly messages: readonly PublierEvenementTempsReelCommand[];
}
