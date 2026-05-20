import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un compte utilisateur a ete deverrouille.
export class CompteDeverrouille extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string) {
    super('CompteDeverrouille');
  }
}
