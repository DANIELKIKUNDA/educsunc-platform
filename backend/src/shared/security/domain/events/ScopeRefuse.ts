import { EvenementDomaine } from '../../../domain/DomainEvent';

export class ScopeRefuse extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string, public readonly typeScope: string, public readonly valeurScope?: string) {
    super('ScopeRefuse');
  }
}
