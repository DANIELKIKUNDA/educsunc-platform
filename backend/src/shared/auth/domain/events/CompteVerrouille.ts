import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un compte utilisateur a ete verrouille.
export class CompteVerrouille extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string, public readonly verrouilleJusqua?: Date) {
    super('CompteVerrouille');
  }
}
