import { EvenementDomaine } from '../../../domain/DomainEvent';

export class AccesAutorise extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string, public readonly permission: string) {
    super('AccesAutorise');
  }
}
