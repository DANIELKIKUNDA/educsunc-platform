import { clientApi } from '../../../services/api';
import {
  construireEntetesContexteActif,
  lireContexteApiActif,
} from '../../../shared/session/api-context';
import type {
  NotificationAcknowledgePayload,
  NotificationApiContext,
  NotificationCreatePayload,
  NotificationEscalatePayload,
  NotificationPublishRealtimePayload,
  NotificationReplayPayload,
  NotificationRetryPayload,
} from '../models/notifications.model';

function construireQueryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([cle, valeur]) => {
    if (valeur === undefined) {
      return;
    }

    const serialisee = String(valeur).trim();
    if (serialisee.length > 0) {
      params.set(cle, serialisee);
    }
  });

  const sortie = params.toString();
  return sortie.length > 0 ? `?${sortie}` : '';
}

function genererIdempotencyKey(prefixe: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefixe}-${crypto.randomUUID()}`;
  }

  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construireEntetesContexte(contexte: NotificationApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error('Le contexte frontend notifications est incomplet.');
  }

  return construireEntetesContexteActif(contexte, { includeSchoolHeader: true });
}

function construireEntetesMutation(
  contexte: NotificationApiContext,
  prefixe: string,
): Record<string, string> {
  return {
    ...construireEntetesContexte(contexte),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

export function lireContexteApiNotifications(): NotificationApiContext {
  return lireContexteApiActif();
}

export const notificationsApi = {
  async creerNotification(payload: NotificationCreatePayload, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/notifications',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'notification-create'),
    });
  },

  async listerNotifications(
    query: { page?: number; taillePage?: number; statut?: string; type?: string },
    contexte: NotificationApiContext,
  ) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications${construireQueryString(query)}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterNotification(id: string, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications/${id}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterTimeline(id: string, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications/${id}/timeline`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async accuserReception(id: string, payload: NotificationAcknowledgePayload, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications/${id}/acknowledge`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'notification-ack'),
    });
  },

  async escaladerNotification(id: string, payload: NotificationEscalatePayload, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications/${id}/escalate`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'notification-escalate'),
    });
  },

  async consulterMonitoring(contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/notifications/monitoring',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterDeadLetter(contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/notifications/dead-letter',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async executerRetry(id: string, payload: NotificationRetryPayload, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications/${id}/retry`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'notification-retry'),
    });
  },

  async consulterRetries(id: string, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications/${id}/retries`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async executerReplay(id: string, payload: NotificationReplayPayload, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications/${id}/replay`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'notification-replay'),
    });
  },

  async consulterDiagnosticReplay(id: string, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/notifications/${id}/replay/diagnostic`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterArchivesOrganisation(
    query: { page?: number; taillePage?: number; ecoleId?: string },
    contexte: NotificationApiContext,
  ) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/admin/notifications/archives${construireQueryString(query)}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterTenantOrganisation(
    query: { ecoleId?: string },
    contexte: NotificationApiContext,
  ) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/admin/notifications/tenant${construireQueryString(query)}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterEscaladesOrganisation(id: string, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/admin/notifications/${id}/escalades`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterCapacitesRealtime(contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/notifications/realtime-futur/capabilities',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async publierTestRealtime(payload: NotificationPublishRealtimePayload, contexte: NotificationApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/notifications/realtime-futur/publish-test',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'notification-realtime-test'),
    });
  },
};
