// Ce fichier declare les contrats HTTP principaux du module Notifications.

/** Cette constante centralise les routes HTTP principales du module Notifications. */
export const ROUTES_HTTP_NOTIFICATIONS = {
  base: '/api/v1/notifications',
  detail: '/api/v1/notifications/:id',
  chronologie: '/api/v1/notifications/:id/timeline',
  accuseReception: '/api/v1/notifications/:id/acknowledge',
  escalade: '/api/v1/notifications/:id/escalate',
} as const;

/** Cette interface represente l'enveloppe de reponse HTTP standard du module. */
export interface ContratReponseHttpNotification<TDonnee> {
  readonly succes: true;
  readonly donnee: TDonnee;
  readonly meta: Readonly<Record<string, unknown>>;
}
