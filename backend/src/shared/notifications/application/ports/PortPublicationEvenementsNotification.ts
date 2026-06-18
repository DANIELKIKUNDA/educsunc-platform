import { EvenementDomaine } from '../../../domain/DomainEvent';

// Ce fichier declare le port applicatif de publication d'evenements.

/** Cette interface isole la publication des evenements de domaine et d'integration. */
export interface PortPublicationEvenementsNotification {
  /** Cette methode publie tous les evenements d'un cycle applicatif. */
  publier(evenements: readonly EvenementDomaine[]): Promise<void>;
}
