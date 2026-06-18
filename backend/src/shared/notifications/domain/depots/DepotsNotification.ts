import { Notification } from '../agregats';
import { EntreeChronologieNotification, ModeleNotification, PreferencesNotification } from '../entites';
import { CanalNotification, TypeNotification } from '../enumerations';

/** Cette interface decrit le depot principal des notifications. */
export interface DepotNotification {
  /** Cette methode persiste l'agregat Notification. */
  sauvegarder(notification: Notification): Promise<void>;

  /** Cette methode retrouve une notification par son identifiant metier. */
  rechercherParId(identifiantNotification: string): Promise<Notification | null>;
}

/** Cette interface decrit l'acces logique aux modeles de notification. */
export interface DepotModelesNotification {
  /** Cette methode retrouve un modele adapte a un type metier et a un canal. */
  rechercherParTypeEtCanal(
    typeNotification: TypeNotification,
    canal: CanalNotification,
    organisationId?: string,
    ecoleId?: string,
  ): Promise<ModeleNotification | null>;
}

/** Cette interface decrit l'acces logique aux preferences resolues. */
export interface DepotPreferencesNotification {
  /** Cette methode retrouve les preferences d'un destinataire. */
  rechercherPourDestinataire(destinataireId: string): Promise<PreferencesNotification | null>;
}

/** Cette interface decrit l'acces logique aux entrees de chronology. */
export interface DepotChronologieNotification {
  /** Cette methode ajoute une entree append-only a la chronology. */
  ajouterEntree(identifiantNotification: string, entree: EntreeChronologieNotification): Promise<void>;
}
