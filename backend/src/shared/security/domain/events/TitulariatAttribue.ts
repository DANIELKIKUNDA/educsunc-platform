import { EvenementDomaine } from '../../../domain/DomainEvent';

export class TitulariatAttribue extends EvenementDomaine {
  constructor(public readonly idAffectationTitulariat: string, public readonly idClasse: string) {
    super('TitulariatAttribue');
  }
}
