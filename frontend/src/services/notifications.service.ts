import { ref } from 'vue';

export interface NotificationMessage {
  id: string;
  titre: string;
  message: string;
  type: 'succes' | 'attention' | 'danger' | 'info';
  timestamp: Date;
  duree?: number;
  actions?: Array<{ libelle: string; action: () => void }>;
}

type NotificationOptions = Partial<Omit<NotificationMessage, 'id' | 'timestamp' | 'titre' | 'message' | 'type'>>;
const MAX_NOTIFICATIONS_VISIBLES = 5;

export const notificationsService = {
  actif: true,
  notifications: ref<NotificationMessage[]>([]),

  ajouter(notification: Omit<NotificationMessage, 'id' | 'timestamp'>) {
    const dejaVisible = this.notifications.value.some((existante) =>
      existante.type === notification.type
      && existante.titre === notification.titre
      && existante.message === notification.message,
    );

    if (dejaVisible) return null;

    const randomId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
    const id = `notif-${Date.now()}-${randomId}`;
    const nouvelleNotification: NotificationMessage = {
      ...notification,
      id,
      timestamp: new Date(),
      duree: notification.duree ?? 5000,
    };

    this.notifications.value.push(nouvelleNotification);
    if (this.notifications.value.length > MAX_NOTIFICATIONS_VISIBLES) {
      this.notifications.value.splice(0, this.notifications.value.length - MAX_NOTIFICATIONS_VISIBLES);
    }

    if (nouvelleNotification.duree && nouvelleNotification.duree > 0) {
      setTimeout(() => this.retirer(id), nouvelleNotification.duree);
    }

    return id;
  },

  retirer(id: string) {
    const index = this.notifications.value.findIndex((notification) => notification.id === id);
    if (index > -1) this.notifications.value.splice(index, 1);
  },

  executerAction(id: string, action: () => void) {
    try {
      action();
    } finally {
      this.retirer(id);
    }
  },

  vider() {
    this.notifications.value = [];
  },

  succes(titre: string, message: string, options?: NotificationOptions) {
    return this.ajouter({ titre, message, type: 'succes', ...options });
  },

  attention(titre: string, message: string, options?: NotificationOptions) {
    return this.ajouter({ titre, message, type: 'attention', ...options });
  },

  danger(titre: string, message: string, options?: NotificationOptions) {
    return this.ajouter({ titre, message, type: 'danger', ...options });
  },

  info(titre: string, message: string, options?: NotificationOptions) {
    return this.ajouter({ titre, message, type: 'info', ...options });
  },

  compterParType() {
    const comptes = { succes: 0, attention: 0, danger: 0, info: 0, total: this.notifications.value.length };
    this.notifications.value.forEach((notification) => { comptes[notification.type] += 1; });
    return comptes;
  },

  recentes(limit = 5) {
    return this.notifications.value
      .slice()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  },
};
