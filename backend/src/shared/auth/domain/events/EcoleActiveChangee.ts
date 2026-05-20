import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'une ecole active de session a ete modifiee.
export class EcoleActiveChangee extends EvenementDomaine {
  constructor(public readonly idSessionUtilisateur: string, public readonly ecoleActiveId?: string) {
    super('EcoleActiveChangee');
  }
}
