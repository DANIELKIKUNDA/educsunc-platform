import { EvenementDomaine } from '../../../domain/DomainEvent';

export class TitulariatExpire extends EvenementDomaine {
  constructor(public readonly idAffectationTitulariat: string, public readonly idClasse: string) {
    super('TitulariatExpire');
  }
}
