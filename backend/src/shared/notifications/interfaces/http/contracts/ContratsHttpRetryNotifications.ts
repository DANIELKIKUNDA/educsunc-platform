// Ce fichier declare les contrats HTTP de retry Notifications.

/** Cette constante centralise les routes HTTP de retry Notifications. */
export const ROUTES_HTTP_RETRY_NOTIFICATIONS = {
  controler: '/api/v1/notifications/:id/retry',
  historique: '/api/v1/notifications/:id/retries',
} as const;
