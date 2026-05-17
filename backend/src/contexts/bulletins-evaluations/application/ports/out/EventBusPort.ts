import type { EvenementDomaine } from 'shared/domain/DomainEvent';

// Ce port abstrait la publication des evenements de domaine apres orchestration.
export interface EventBusPort {
  publier(evenements: EvenementDomaine[]): Promise<void>;
}
