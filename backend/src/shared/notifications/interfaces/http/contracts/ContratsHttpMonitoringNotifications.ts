// Ce fichier declare les contrats HTTP de monitoring Notifications.

/** Cette constante centralise les routes HTTP de monitoring Notifications. */
export const ROUTES_HTTP_MONITORING_NOTIFICATIONS = {
  monitoring: '/api/v1/notifications/monitoring',
  deadLetters: '/api/v1/notifications/dead-letter',
} as const;
