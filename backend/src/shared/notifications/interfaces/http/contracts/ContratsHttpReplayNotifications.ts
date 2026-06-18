// Ce fichier declare les contrats HTTP de replay Notifications.

/** Cette constante centralise les routes HTTP de replay Notifications. */
export const ROUTES_HTTP_REPLAY_NOTIFICATIONS = {
  rejouer: '/api/v1/notifications/:id/replay',
  diagnostic: '/api/v1/notifications/:id/replay/diagnostic',
} as const;
