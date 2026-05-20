import { EvenementDomaine } from '../../../domain/DomainEvent';

export class ScopeAjouteAffectation extends EvenementDomaine {
  constructor(public readonly idAffectationUtilisateur: string, public readonly typeScope: string, public readonly valeurScope: string) {
    super('ScopeAjouteAffectation');
  }
}
