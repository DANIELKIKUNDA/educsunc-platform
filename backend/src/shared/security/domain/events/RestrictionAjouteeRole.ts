import { EvenementDomaine } from '../../../domain/DomainEvent';

export class RestrictionAjouteeRole extends EvenementDomaine {
  constructor(public readonly idRole: string, public readonly restriction: string) {
    super('RestrictionAjouteeRole');
  }
}
