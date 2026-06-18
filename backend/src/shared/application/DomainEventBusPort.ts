import type { EvenementDomaine } from '../domain/DomainEvent';
import type { SharedBusEventMetadata } from '../infrastructure/bus/SharedEventBusTypes';

// Ce port mutualise la publication d'evenements de domaine entre BC sans couplage a un broker.
export interface DomainEventBusPort {
  publier(
    evenements: EvenementDomaine[],
    metadata?: Partial<SharedBusEventMetadata>,
  ): Promise<void>;
}
