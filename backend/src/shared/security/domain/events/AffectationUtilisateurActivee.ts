import { EvenementDomaine } from '../../../domain/DomainEvent';

export class AffectationUtilisateurActivee extends EvenementDomaine {
  constructor(public readonly idAffectationUtilisateur: string) {
    super('AffectationUtilisateurActivee');
  }
}
