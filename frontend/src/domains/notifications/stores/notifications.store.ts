import { reactive } from 'vue';
import {
  formatJson,
  lireArchives,
  lireDeadLettersNotification,
  lireDetailNotification,
  lireEscalades,
  lireListeNotifications,
  lireMonitoringNotification,
  lireRealtimeCapabilities,
  lireReplayDiagnostic,
  lireRetryHistory,
  lireTenant,
  lireTimelineNotification,
} from '../mappers/notifications.mapper';
import type {
  NotificationAcknowledgePayload,
  NotificationArchiveItem,
  NotificationCreatePayload,
  NotificationDeadLetterItem,
  NotificationDetailItem,
  NotificationEscalatePayload,
  NotificationEscalationTrace,
  NotificationListItem,
  NotificationMonitoringItem,
  NotificationPublishRealtimePayload,
  NotificationRealtimeCapabilities,
  NotificationRetryHistoryItem,
  NotificationReplayPayload,
  NotificationRetryPayload,
  NotificationTenantItem,
  NotificationTimelineItem,
} from '../models/notifications.model';
import { lireContexteApiNotifications, notificationsApi } from '../services/notifications.api';

interface NotificationsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  list: readonly NotificationListItem[];
  detail: NotificationDetailItem | null;
  timeline: readonly NotificationTimelineItem[];
  monitoring: NotificationMonitoringItem | null;
  deadLetters: readonly NotificationDeadLetterItem[];
  retries: readonly NotificationRetryHistoryItem[];
  replayDiagnostic: unknown;
  archives: readonly NotificationArchiveItem[];
  tenant: NotificationTenantItem | null;
  escalades: NotificationEscalationTrace | null;
  realtime: NotificationRealtimeCapabilities | null;
  lastMutation: unknown;
}

export function useNotificationsStore() {
  const state = reactive({
    status: 'idle',
    errorMessage: null,
    list: [],
    detail: null,
    timeline: [],
    monitoring: null,
    deadLetters: [],
    retries: [],
    replayDiagnostic: null,
    archives: [],
    tenant: null,
    escalades: null,
    realtime: null,
    lastMutation: null,
  }) as NotificationsState;

  async function executer(action: () => Promise<void>, fallbackMessage: string): Promise<void> {
    state.status = 'loading';
    state.errorMessage = null;

    try {
      await action();
      state.status = 'ready';
    } catch (error) {
      state.status = 'error';
      state.errorMessage = error instanceof Error ? error.message : fallbackMessage;
    }
  }

  async function creer(payload: NotificationCreatePayload): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.creerNotification(payload, lireContexteApiNotifications());
      state.lastMutation = raw;
      state.detail = lireDetailNotification(raw);
    }, 'La creation de notification a echoue.');
  }

  async function chargerListe(query: { page?: number; taillePage?: number; statut?: string; type?: string } = {}): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.listerNotifications(query, lireContexteApiNotifications());
      state.list = lireListeNotifications(raw);
    }, 'La lecture de la liste des notifications a echoue.');
  }

  async function chargerDetail(id: string): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterNotification(id, lireContexteApiNotifications());
      state.detail = lireDetailNotification(raw);
    }, 'La lecture du detail notification a echoue.');
  }

  async function chargerTimeline(id: string): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterTimeline(id, lireContexteApiNotifications());
      state.timeline = lireTimelineNotification(raw);
    }, 'La lecture de la timeline notification a echoue.');
  }

  async function accuserReception(id: string, payload: NotificationAcknowledgePayload): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.accuserReception(id, payload, lireContexteApiNotifications());
      state.lastMutation = raw;
    }, 'L accuse de reception a echoue.');
  }

  async function escalader(id: string, payload: NotificationEscalatePayload): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.escaladerNotification(id, payload, lireContexteApiNotifications());
      state.lastMutation = raw;
    }, 'L escalade de notification a echoue.');
  }

  async function chargerMonitoring(): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterMonitoring(lireContexteApiNotifications());
      state.monitoring = lireMonitoringNotification(raw);
    }, 'La lecture du monitoring notifications a echoue.');
  }

  async function chargerDeadLetter(): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterDeadLetter(lireContexteApiNotifications());
      state.deadLetters = lireDeadLettersNotification(raw);
    }, 'La lecture de la dead-letter notifications a echoue.');
  }

  async function executerRetry(id: string, payload: NotificationRetryPayload): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.executerRetry(id, payload, lireContexteApiNotifications());
      state.lastMutation = raw;
    }, 'Le retry notification a echoue.');
  }

  async function chargerRetries(id: string): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterRetries(id, lireContexteApiNotifications());
      state.retries = lireRetryHistory(raw);
    }, 'La lecture de l historique retry a echoue.');
  }

  async function executerReplay(id: string, payload: NotificationReplayPayload): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.executerReplay(id, payload, lireContexteApiNotifications());
      state.lastMutation = raw;
    }, 'Le replay notification a echoue.');
  }

  async function chargerDiagnosticReplay(id: string): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterDiagnosticReplay(id, lireContexteApiNotifications());
      state.replayDiagnostic = lireReplayDiagnostic(raw);
    }, 'La lecture du diagnostic replay a echoue.');
  }

  async function chargerArchives(query: { page?: number; taillePage?: number; ecoleId?: string } = {}): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterArchivesOrganisation(query, lireContexteApiNotifications());
      state.archives = lireArchives(raw)?.elements ?? [];
    }, 'La lecture des archives notifications a echoue.');
  }

  async function chargerTenant(query: { ecoleId?: string } = {}): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterTenantOrganisation(query, lireContexteApiNotifications());
      state.tenant = lireTenant(raw);
    }, 'La lecture tenant notifications a echoue.');
  }

  async function chargerEscalades(id: string): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterEscaladesOrganisation(id, lireContexteApiNotifications());
      state.escalades = lireEscalades(raw);
    }, 'La lecture des escalades a echoue.');
  }

  async function chargerCapacitesRealtime(): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.consulterCapacitesRealtime(lireContexteApiNotifications());
      state.realtime = lireRealtimeCapabilities(raw);
    }, 'La lecture des capacites temps reel a echoue.');
  }

  async function publierTestRealtime(payload: NotificationPublishRealtimePayload): Promise<void> {
    await executer(async () => {
      const raw = await notificationsApi.publierTestRealtime(payload, lireContexteApiNotifications());
      state.lastMutation = raw;
    }, 'La publication de test temps reel a echoue.');
  }

  function viderErreur(): void {
    state.errorMessage = null;
    if (state.status === 'error') {
      state.status = 'idle';
    }
  }

  return {
    state,
    creer,
    chargerListe,
    chargerDetail,
    chargerTimeline,
    accuserReception,
    escalader,
    chargerMonitoring,
    chargerDeadLetter,
    executerRetry,
    chargerRetries,
    executerReplay,
    chargerDiagnosticReplay,
    chargerArchives,
    chargerTenant,
    chargerEscalades,
    chargerCapacitesRealtime,
    publierTestRealtime,
    viderErreur,
    formatJson,
  };
}
