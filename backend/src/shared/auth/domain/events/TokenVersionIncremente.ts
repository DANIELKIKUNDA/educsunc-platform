import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale que la version logique des jetons a change.
export class TokenVersionIncremente extends EvenementDomaine {
  constructor(public readonly idUtilisateur: string, public readonly tokenVersion: number) {
    super('TokenVersionIncremente');
  }
}
