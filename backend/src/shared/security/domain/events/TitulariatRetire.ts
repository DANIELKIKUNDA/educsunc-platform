import { EvenementDomaine } from '../../../domain/DomainEvent';

export class TitulariatRetire extends EvenementDomaine {
  constructor(public readonly idAffectationTitulariat: string, public readonly idClasse: string) {
    super('TitulariatRetire');
  }
}
