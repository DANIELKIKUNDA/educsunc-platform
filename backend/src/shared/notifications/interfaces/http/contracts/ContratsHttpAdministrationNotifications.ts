// Ce fichier declare les contrats HTTP d'administration Notifications.

/** Cette constante centralise les routes HTTP d'administration Notifications. */
export const ROUTES_HTTP_ADMINISTRATION_NOTIFICATIONS = {
  archives: '/api/v1/admin/notifications/archives',
  tenant: '/api/v1/admin/notifications/tenant',
  traceEscalade: '/api/v1/admin/notifications/:id/escalades',
} as const;
