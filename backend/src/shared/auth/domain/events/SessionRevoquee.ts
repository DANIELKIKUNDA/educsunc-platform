import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'une session persistante vient d'etre revoquee.
export class SessionRevoquee extends EvenementDomaine {
  constructor(public readonly idSessionUtilisateur: string, public readonly idUtilisateur: string, public readonly raison?: string) {
    super('SessionRevoquee');
  }
}
