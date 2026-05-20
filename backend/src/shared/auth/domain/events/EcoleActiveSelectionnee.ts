import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale la selection explicite d'une ecole active.
export class EcoleActiveSelectionnee extends EvenementDomaine {
  constructor(public readonly idContexteActifAuth: string, public readonly ecoleActiveId?: string) {
    super('EcoleActiveSelectionnee');
  }
}
