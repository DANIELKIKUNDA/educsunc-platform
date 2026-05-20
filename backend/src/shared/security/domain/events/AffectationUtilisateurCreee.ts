import { EvenementDomaine } from '../../../domain/DomainEvent';

export class AffectationUtilisateurCreee extends EvenementDomaine {
  constructor(public readonly idAffectationUtilisateur: string, public readonly idUtilisateur: string) {
    super('AffectationUtilisateurCreee');
  }
}
