import { EvenementDomaine } from '../../../domain/DomainEvent';

export class EcoleActiveChangee extends EvenementDomaine {
  constructor(public readonly idContexteActifUtilisateur: string, public readonly idEcoleActive?: string) {
    super('EcoleActiveChangee');
  }
}
