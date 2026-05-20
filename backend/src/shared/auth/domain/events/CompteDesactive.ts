import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un compte utilisateur a ete desactive.
export class CompteDesactive extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string) {
    super('CompteDesactive');
  }
}
