import { StatutNotification } from '../enumerations';

// Cette constante porte la machine de transitions officielle du document pour les notifications.
export const GRAPH_STATUTS_NOTIFICATION: Record<StatutNotification, readonly StatutNotification[]> = {
  CREATED: ['VALIDATED', 'CANCELLED', 'EXPIRED'],
  VALIDATED: ['SCHEDULED', 'QUEUED', 'CANCELLED', 'EXPIRED'],
  SCHEDULED: ['QUEUED', 'CANCELLED', 'EXPIRED'],
  QUEUED: ['PROCESSING', 'CANCELLED', 'EXPIRED'],
  PROCESSING: ['SENT', 'FAILED', 'FALLBACK_PROCESSING', 'EXPIRED'],
  SENT: ['DELIVERED', 'READ', 'ARCHIVED'],
  DELIVERED: ['READ', 'ARCHIVED'],
  READ: ['ARCHIVED'],
  FAILED: ['RETRYING', 'FALLBACK_PROCESSING', 'EXPIRED', 'ARCHIVED'],
  RETRYING: ['PROCESSING', 'FAILED', 'FALLBACK_PROCESSING', 'EXPIRED'],
  FALLBACK_PROCESSING: ['SENT', 'FAILED', 'RETRYING', 'EXPIRED'],
  EXPIRED: ['ARCHIVED'],
  CANCELLED: ['ARCHIVED'],
  REPLAYING: ['ARCHIVED', 'FAILED'],
  ARCHIVED: [],
};
