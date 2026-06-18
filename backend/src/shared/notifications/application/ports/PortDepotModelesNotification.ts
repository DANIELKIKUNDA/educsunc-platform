import { CanalNotification, ModeleNotification, TypeNotification } from '../../domain';

// Ce fichier declare le port applicatif de lecture des modeles de notification.

/** Cette interface isole la resolution d'un modele de notification. */
export interface PortDepotModelesNotification {
  /** Cette methode recherche un modele applicable a un type et un canal. */
  rechercherParTypeEtCanal(
    typeNotification: TypeNotification,
    canal: CanalNotification,
    organisationId?: string,
    ecoleId?: string,
  ): Promise<ModeleNotification | null>;
}
