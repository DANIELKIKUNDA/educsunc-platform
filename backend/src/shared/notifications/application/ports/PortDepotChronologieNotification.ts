import { EntreeChronologieNotification } from '../../domain';

// Ce fichier declare le port applicatif de persistence de la chronologie.

/** Cette interface isole l'ajout append-only dans la chronologie Notifications. */
export interface PortDepotChronologieNotification {
  /** Cette methode ajoute une entree de chronologie pour une notification. */
  ajouterEntree(identifiantNotification: string, entree: EntreeChronologieNotification): Promise<void>;
}
