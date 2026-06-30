import type {
  NotificationArchiveItem,
  NotificationArchivesPage,
  NotificationDeadLetterItem,
  NotificationDetailItem,
  NotificationEscalationTrace,
  NotificationListItem,
  NotificationMonitoringItem,
  NotificationRealtimeCapabilities,
  NotificationRetryHistoryItem,
  NotificationTenantItem,
  NotificationTimelineItem,
} from '../models/notifications.model';

export function lireEnveloppe<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;

    if ('donnees' in candidate) {
      return (candidate.donnees as T) ?? fallback;
    }

    if ('data' in candidate) {
      return (candidate.data as T) ?? fallback;
    }
  }

  return (payload as T) ?? fallback;
}

export function lireListeNotifications(payload: unknown): readonly NotificationListItem[] {
  const data = lireEnveloppe<unknown>(payload, []);

  if (Array.isArray(data)) {
    return data as NotificationListItem[];
  }

  if (data && typeof data === 'object') {
    const candidate = data as Record<string, unknown>;
    if (Array.isArray(candidate.elements)) {
      return candidate.elements as NotificationListItem[];
    }
    if (Array.isArray(candidate.items)) {
      return candidate.items as NotificationListItem[];
    }
  }

  return [];
}

export function lireDetailNotification(payload: unknown): NotificationDetailItem | null {
  return lireEnveloppe<NotificationDetailItem | null>(payload, null);
}

export function lireTimelineNotification(payload: unknown): readonly NotificationTimelineItem[] {
  const data = lireEnveloppe<unknown>(payload, []);
  return Array.isArray(data) ? (data as NotificationTimelineItem[]) : [];
}

export function lireMonitoringNotification(payload: unknown): NotificationMonitoringItem | null {
  return lireEnveloppe<NotificationMonitoringItem | null>(payload, null);
}

export function lireDeadLettersNotification(payload: unknown): readonly NotificationDeadLetterItem[] {
  const data = lireEnveloppe<unknown>(payload, []);
  return Array.isArray(data) ? (data as NotificationDeadLetterItem[]) : [];
}

export function lireRetryHistory(payload: unknown): readonly NotificationRetryHistoryItem[] {
  const data = lireEnveloppe<unknown>(payload, []);
  return Array.isArray(data) ? (data as NotificationRetryHistoryItem[]) : [];
}

export function lireReplayDiagnostic(payload: unknown): unknown {
  return lireEnveloppe<unknown>(payload, null);
}

export function lireArchives(payload: unknown): NotificationArchivesPage | null {
  return lireEnveloppe<NotificationArchivesPage | null>(payload, null);
}

export function lireTenant(payload: unknown): NotificationTenantItem | null {
  return lireEnveloppe<NotificationTenantItem | null>(payload, null);
}

export function lireEscalades(payload: unknown): NotificationEscalationTrace | null {
  return lireEnveloppe<NotificationEscalationTrace | null>(payload, null);
}

export function lireRealtimeCapabilities(payload: unknown): NotificationRealtimeCapabilities | null {
  return lireEnveloppe<NotificationRealtimeCapabilities | null>(payload, null);
}

export function resumeNotification(notification: NotificationDetailItem | null): string {
  if (!notification) {
    return 'Aucune notification selectionnee.';
  }

  return `${notification.identifiant} | ${notification.statut} | ${notification.canaux.join(', ')}`;
}

export function resumeMonitoring(monitoring: NotificationMonitoringItem | null): string {
  if (!monitoring) {
    return 'Aucun monitoring charge.';
  }

  return `Total ${monitoring.total} | Echec ${monitoring.enEchec} | Dead-letter ${monitoring.enDeadLetter}`;
}

export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
