// Ce fichier definit le port applicatif vers la communication.
export interface NotificationScolarite {
  destinataire: string;
  sujet: string;
  message: string;
}

/**
 * Ce port demande l'envoi de notifications sans coupler le BC a un fournisseur.
 */
export interface CommunicationPort {
  demanderNotification(notification: NotificationScolarite): Promise<void>;
}
