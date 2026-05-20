import { EvenementDomaine } from '../../../domain/DomainEvent';

export class AffectationUtilisateurExpiree extends EvenementDomaine {
  constructor(public readonly idAffectationUtilisateur: string) {
    super('AffectationUtilisateurExpiree');
  }
}
