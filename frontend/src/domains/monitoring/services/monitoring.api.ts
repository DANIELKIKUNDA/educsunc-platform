import { clientApi } from '../../../services/api';
import {
  construireEntetesContexteActif,
  lireContexteApiActif,
} from '../../../shared/session/api-context';
import type { MonitoringApiContext, MonitoringMutationPayload } from '../models/monitoring.model';

function genererIdempotencyKey(prefixe: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefixe}-${crypto.randomUUID()}`;
  }

  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construireEntetesContexte(contexte: MonitoringApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error('Le contexte frontend monitoring est incomplet.');
  }

  return construireEntetesContexteActif(contexte, { includeSchoolHeader: true });
}

function construireEntetesMutation(contexte: MonitoringApiContext, prefixe: string): Record<string, string> {
  return {
    ...construireEntetesContexte(contexte),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

export function lireContexteApiMonitoring(): MonitoringApiContext {
  return lireContexteApiActif();
}

export const monitoringApi = {
  async lireEtat(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/state',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async lireDashboard(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/dashboard',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async lireObservabilite(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/observability',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async lireHealth(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/health',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async lireHealthSnapshot(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/health/snapshot',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async lireIncidents(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/incidents',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async ouvrirIncident(payload: MonitoringMutationPayload, contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/incidents',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'monitoring-incident-open'),
    });
  },

  async escaladerIncident(id: string, contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/monitoring/incidents/${id}/escalate`,
      methode: 'POST',
      entetes: construireEntetesMutation(contexte, 'monitoring-incident-escalate'),
    });
  },

  async lireAlertes(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/alerts',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async creerAlerte(payload: MonitoringMutationPayload, contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/alerts',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'monitoring-alert-create'),
    });
  },

  async resoudreAlerte(id: string, payload: MonitoringMutationPayload, contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/monitoring/alerts/${id}/resolve`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'monitoring-alert-resolve'),
    });
  },

  async lireDiagnostics(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/diagnostics',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async genererDiagnostic(idIncident: string, payload: MonitoringMutationPayload, contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/monitoring/incidents/${idIncident}/diagnostics`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'monitoring-diagnostic-generate'),
    });
  },

  async lireCapacite(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/capacity',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async calculerCapacite(payload: MonitoringMutationPayload, contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/capacity',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'monitoring-capacity-calculate'),
    });
  },

  async calculerSaturation(payload: MonitoringMutationPayload, contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/capacity/saturation',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'monitoring-saturation-calculate'),
    });
  },

  async lireTraces(contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/traces',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async capturerTrace(payload: MonitoringMutationPayload, contexte: MonitoringApiContext) {
    return clientApi.envoyer<unknown>({
      chemin: '/api/v1/monitoring/traces',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'monitoring-trace-capture'),
    });
  },
};
