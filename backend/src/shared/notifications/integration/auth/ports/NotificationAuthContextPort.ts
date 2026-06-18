import type { PortAutorisationNotification } from '../../../application';
import type {
  NotificationAuthContexteActif,
  NotificationAuthDemandeAutorisation,
} from '../NotificationsAuthIntegrationTypes';

// Ce fichier declare le contrat local du pont Auth pour Notifications.

/** Cette interface expose l'acces au contexte Auth sans coupler directement Notifications au module Auth. */
export interface NotificationAuthContextPort extends PortAutorisationNotification {
  /** Cette methode retourne le contexte Auth actif pour un utilisateur ou une session. */
  rechercherContexteActif(params: {
    readonly utilisateurId?: string;
    readonly sessionId?: string;
  }): Promise<NotificationAuthContexteActif | null>;

  /** Cette methode verifie une demande d'autorisation deja normalisee. */
  estAutorisePourDemande(demande: NotificationAuthDemandeAutorisation): Promise<boolean>;
}
