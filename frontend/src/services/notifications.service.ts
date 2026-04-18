import { ref, reactive } from 'vue';

export interface NotificationMessage {
  id: string;
  titre: string;
  message: string;
  type: 'succes' | 'attention' | 'danger' | 'info';
  timestamp: Date;
  duree?: number; // en millisecondes, auto-dismiss
  actions?: Array<{ libelle: string; action: () => void }>;
}

// Service de notifications frontend avec compatibilitÃ© prÃ©servÃ©e
export const notificationsService = {
  // PropriÃ©tÃ© existante prÃ©servÃ©e pour compatibilitÃ©
  actif: true,

  // Nouvelles fonctionnalitÃ©s
  notifications: ref<NotificationMessage[]>([]),

  // Ajouter une notification
  ajouter(notification: Omit<NotificationMessage, 'id' | 'timestamp'>) {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nouvelleNotification: NotificationMessage = {
      ...notification,
      id,
      timestamp: new Date(),
      duree: notification.duree || 5000, // 5 secondes par dÃ©faut
    };

    this.notifications.value.push(nouvelleNotification);

    // Auto-dismiss si durÃ©e dÃ©finie
    if (nouvelleNotification.duree && nouvelleNotification.duree > 0) {
      setTimeout(() => {
        this.retirer(id);
      }, nouvelleNotification.duree);
    }

    return id;
  },

  // Retirer une notification
  retirer(id: string) {
    const index = this.notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.value.splice(index, 1);
    }
  },

  // Vider toutes les notifications
  vider() {
    this.notifications.value = [];
  },

  // Notifications prÃ©dÃ©finies
  succes(titre: string, message: string, options?: Partial<Omit<NotificationMessage, 'id' | 'timestamp' | 'titre' | 'message' | 'type'>>) {
    return this.ajouter({ titre, message, type: 'succes', ...options });
  },

  attention(titre: string, message: string, options?: Partial<Omit<NotificationMessage, 'id' | 'timestamp' | 'titre' | 'message' | 'type'>>) {
    return this.ajouter({ titre, message, type: 'attention', ...options });
  },

  danger(titre: string, message: string, options?: Partial<Omit<NotificationMessage, 'id' | 'timestamp' | 'titre' | 'message' | 'type'>>) {
    return this.ajouter({ titre, message, type: 'danger', ...options });
  },

  info(titre: string, message: string, options?: Partial<Omit<NotificationMessage, 'id' | 'timestamp' | 'titre' | 'message' | 'type'>>) {
    return this.ajouter({ titre, message, type: 'info', ...options });
  },

  // Compter les notifications par type
  compterParType() {
    const comptes = {
      succes: 0,
      attention: 0,
      danger: 0,
      info: 0,
      total: this.notifications.value.length,
    };

    this.notifications.value.forEach(notification => {
      comptes[notification.type]++;
    });

    return comptes;
  },

  // Obtenir les notifications rÃ©centes (derniÃ¨res N)
  recentes(limit: number = 5) {
    return this.notifications.value
      .slice()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  },
};
