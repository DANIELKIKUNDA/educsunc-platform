// Ce fichier declare les contrats HTTP du futur temps reel Notifications.

/** Cette constante centralise les routes HTTP du futur temps reel Notifications. */
export const ROUTES_HTTP_TEMPS_REEL_NOTIFICATIONS = {
  capacites: '/api/v1/notifications/realtime-futur/capabilities',
  publicationTest: '/api/v1/notifications/realtime-futur/publish-test',
} as const;
