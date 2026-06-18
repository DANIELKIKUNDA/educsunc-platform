import type { EvenementDomaine } from 'shared/domain/DomainEvent';
import type { SharedBusEventMetadata } from 'shared/infrastructure/bus';

// Ce port abstrait la publication des evenements de domaine apres orchestration.
export interface EventBusPort {
  publier(
    evenements: EvenementDomaine[],
    metadata?: Partial<SharedBusEventMetadata>,
  ): Promise<void>;
}
