import { EvenementDomaine } from '../../../domain/DomainEvent';

export class RestrictionMetierDetectee extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string, public readonly codeRestriction: string) {
    super('RestrictionMetierDetectee');
  }
}
